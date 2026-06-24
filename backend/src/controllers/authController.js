import * as authService from '../services/authService.js';

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const result = await authService.register({ name, email, password });
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({ message: 'Регистрация успешна', token: result.token, user: result.user });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });
    setRefreshCookie(res, result.refreshToken);
    res.json({ message: 'Вход выполнен', token: result.token, user: result.user });
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const oldToken = req.cookies?.refreshToken;
    const result = await authService.refresh(oldToken);
    setRefreshCookie(res, result.refreshToken);
    res.json({ token: result.token, user: result.user });
  } catch (error) {
    res.clearCookie('refreshToken');
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    await authService.logout(token);
    res.clearCookie('refreshToken');
    res.json({ message: 'Выход выполнен' });
  } catch (error) {
    next(error);
  }
}

async function logoutAll(req, res, next) {
  try {
    await authService.logoutAll(req.user.id);
    res.clearCookie('refreshToken');
    res.json({ message: 'Выход выполнен со всех устройств' });
  } catch (error) {
    next(error);
  }
}

async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;
    const result = await authService.loginWithGoogle(idToken);
    setRefreshCookie(res, result.refreshToken);
    res.json({ message: 'Вход через Google выполнен', token: result.token, user: result.user });
  } catch (error) {
    next(error);
  }
}

export { register, login, refresh, logout, logoutAll, googleLogin };