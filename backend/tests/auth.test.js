import { describe, test, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';

vi.mock('../src/services/authService.js', () => ({
  register: vi.fn(),
  login: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  logoutAll: vi.fn(),
  loginWithGoogle: vi.fn()
}));
vi.mock('google-auth-library', () => {
  class MockOAuth2Client {
    verifyIdToken = vi.fn();
  }

  return {
    OAuth2Client: MockOAuth2Client
  };
});

import * as authService from '../src/services/authService.js';
import authRoutes from '../src/routes/authRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

describe('POST /auth/register', () => {
  beforeEach(() => vi.clearAllMocks());

  test('400 если нет email', async () => {
    const res = await request(app).post('/auth/register').send({ password: '123456' });
    expect(res.status).toBe(400);
  });

  test('400 если нет пароля', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
  });

  test('400 если пароль меньше 6 символов', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'test@test.com', password: '123' });
    expect(res.status).toBe(400);
  });

  test('400 если некорректный email', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'notanemail', password: '123456' });
    expect(res.status).toBe(400);
  });

  test('400 если пользователь уже существует', async () => {
    authService.register.mockRejectedValue(Object.assign(new Error('Пользователь уже существует'), { status: 400 }));
    const res = await request(app).post('/auth/register').send({ email: 'exists@test.com', password: '123456' });
    expect(res.status).toBe(400);
  });

  test('201 при успешной регистрации', async () => {
    authService.register.mockResolvedValue({
      token: 'access_token',
      refreshToken: 'refresh_token',
      user: { id: 1, name: 'Test', email: 'test@test.com', role: 'user' }
    });
    const res = await request(app).post('/auth/register').send({ email: 'test@test.com', password: '123456' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });
});

describe('POST /auth/login', () => {
  beforeEach(() => vi.clearAllMocks());

  test('400 если нет email', async () => {
    const res = await request(app).post('/auth/login').send({ password: '123456' });
    expect(res.status).toBe(400);
  });

  test('401 если пользователь не найден', async () => {
    authService.login.mockRejectedValue(Object.assign(new Error('Неверный email или пароль'), { status: 401 }));
    const res = await request(app).post('/auth/login').send({ email: 'noone@test.com', password: '123456' });
    expect(res.status).toBe(401);
  });
});