const express      = require('express');
const cors         = require('cors');
const dotenv       = require('dotenv');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const logger       = require('./src/utils/logger');

dotenv.config();

const authRoutes            = require('./src/routes/authRoutes');
const profileRoutes         = require('./src/routes/profileRoutes');
const institutionsRoutes    = require('./src/routes/institutionsRoutes');
const specialtiesRoutes     = require('./src/routes/specialtiesRoutes');
const programsRoutes        = require('./src/routes/programsRoutes');
const testRoutes            = require('./src/routes/testRoutes');
const recommendationsRoutes = require('./src/routes/recommendationsRoutes');
const adminRoutes           = require('./src/routes/adminRoutes');
const favoritesRoutes       = require('./src/routes/favoritesRoutes');
const errorHandler          = require('./src/middleware/errorHandler');
const swaggerUi             = require('swagger-ui-express');
const swaggerSpec           = require('./src/config/swagger');


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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server started on http://localhost:${PORT}`);
});