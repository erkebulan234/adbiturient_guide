const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Мокаем pool чтобы не нужна реальная БД
jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));

const pool = require('../src/config/db');
const authRoutes = require('../src/routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

describe('POST /auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  test('400 если нет email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ password: '123456' });
    expect(res.status).toBe(400);
  });

  test('400 если нет пароля', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
  });

  test('400 если пароль меньше 6 символов', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@test.com', password: '123' });
    expect(res.status).toBe(400);
  });

  test('400 если некорректный email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'notanemail', password: '123456' });
    expect(res.status).toBe(400);
  });

  test('400 если пользователь уже существует', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'exists@test.com', password: '123456' });
    expect(res.status).toBe(400);
  });

  test('201 при успешной регистрации', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Test', email: 'test@test.com', role: 'user' }] });

    process.env.JWT_SECRET = 'test_secret';

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@test.com', password: '123456' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });
});

describe('POST /auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  test('400 если нет email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ password: '123456' });
    expect(res.status).toBe(400);
  });

  test('401 если пользователь не найден', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'noone@test.com', password: '123456' });
    expect(res.status).toBe(401);
  });
});