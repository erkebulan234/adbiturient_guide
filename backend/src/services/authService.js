import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository.js';
import * as refreshTokenRepository from '../repositories/refreshTokenRepository.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 дней

function createAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

async function issueTokens(user) {
  await refreshTokenRepository.deleteExpiredByUser(user.id);
  const accessToken  = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await refreshTokenRepository.store(user.id, refreshToken, expiresAt);

  return { token: accessToken, refreshToken, user: formatUser(user) };
}

async function register({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await userRepository.findByEmail(normalizedEmail);
  if (existing) {
    const error = new Error('Пользователь уже существует');
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const trimmedName = name ? name.trim().slice(0, 120) : null;

  const user = await userRepository.create({
    name: trimmedName,
    email: normalizedEmail,
    passwordHash
  });

  return issueTokens(user);
}

async function login({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await userRepository.findByEmail(normalizedEmail);
  if (!user) {
    const error = new Error('Неверный email или пароль');
    error.status = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Неверный email или пароль');
    error.status = 401;
    throw error;
  }

  return issueTokens(user);
}

async function refresh(oldRefreshToken) {
  if (!oldRefreshToken) {
    const error = new Error('Refresh token отсутствует');
    error.status = 401;
    throw error;
  }

  // Проверяем подпись JWT
  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    const error = new Error('Недействительный refresh token');
    error.status = 401;
    throw error;
  }

  // Проверяем что токен есть в БД и не отозван/не истёк
  const stored = await refreshTokenRepository.find(oldRefreshToken);
  if (!stored) {
    // Токен валиден по подписи, но отсутствует в БД —
    // возможна повторная попытка использовать украденный/уже ротированный токен.
    // На всякий случай отзываем все токены пользователя.
    await refreshTokenRepository.revokeAllForUser(decoded.id);
    const error = new Error('Недействительный refresh token');
    error.status = 401;
    throw error;
  }

  const user = await userRepository.findById(decoded.id);
  if (!user) {
    const error = new Error('Пользователь не найден');
    error.status = 401;
    throw error;
  }

  // Ротация: старый токен отзываем, выдаём новую пару
  await refreshTokenRepository.revoke(oldRefreshToken);
  return issueTokens(user);
}

async function logout(refreshToken) {
  if (refreshToken) {
    await refreshTokenRepository.revoke(refreshToken);
  }
}

async function logoutAll(userId) {
  await refreshTokenRepository.revokeAllForUser(userId);
}


async function loginWithGoogle(idToken) {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    payload = ticket.getPayload();
  } catch {
    const error = new Error('Недействительный Google токен');
    error.status = 401;
    throw error;
  }

  const { sub: googleId, email, name } = payload;
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Уже привязан Google ID
  let user = await userRepository.findByGoogleId(googleId);

  // 2. Есть пользователь с таким email, но без привязки Google — привязываем
  if (!user) {
    user = await userRepository.findByEmail(normalizedEmail);
    if (user) {
      await userRepository.linkGoogleId(user.id, googleId);
    }
  }

  // 3. Новый пользователь
  if (!user) {
    user = await userRepository.createWithGoogle({
      name: name || null,
      email: normalizedEmail,
      googleId
    });
  }

  return issueTokens(user);
}

export { register, login, refresh, logout, logoutAll, loginWithGoogle };