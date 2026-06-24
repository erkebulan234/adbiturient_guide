import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import logger from './src/utils/logger.js';

dotenv.config();

import authRoutes from './src/routes/authRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import institutionsRoutes from './src/routes/institutionsRoutes.js';
import specialtiesRoutes from './src/routes/specialtiesRoutes.js';
import programsRoutes from './src/routes/programsRoutes.js';
import testRoutes from './src/routes/testRoutes.js';
import recommendationsRoutes from './src/routes/recommendationsRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import favoritesRoutes from './src/routes/favoritesRoutes.js';

import errorHandler from './src/middleware/errorHandler.js';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/config/swagger.js';

import healthRoutes from './src/routes/healthRoutes.js';

const app = express();

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Логируем каждый запрос
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip
  });
  next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Слишком много попыток. Попробуйте через 15 минут.' },
  standardHeaders: true,
  legacyHeaders: false
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Слишком много запросов.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend работает' });
});

if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Навигатор абитуриента — API',
    customCss: '.swagger-ui .topbar { display: none }'
  }));
}

app.use('/auth/login',    authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth/refresh',  refreshLimiter);

app.use('/auth',                authRoutes);
app.use('/api/profile',         profileRoutes);
app.use('/api/institutions',    institutionsRoutes);
app.use('/api/specialties',     specialtiesRoutes);
app.use('/api/programs',        programsRoutes);
app.use('/api/test',            testRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/favorites',       favoritesRoutes);
app.use('/admin',               adminRoutes);
app.use(errorHandler);

app.use('/api/health', healthRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server started on http://localhost:${PORT}`);
});