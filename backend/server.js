const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./src/middleware/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const institutionsRoutes = require('./src/routes/institutionsRoutes');
const specialtiesRoutes = require('./src/routes/specialtiesRoutes');
const programsRoutes = require('./src/routes/programsRoutes');
const testRoutes = require('./src/routes/testRoutes');
const recommendationsRoutes = require('./src/routes/recommendationsRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // максимум 10 запросов
  message: { message: 'Слишком много попыток. Попробуйте через 15 минут.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend работает' });
});

app.use('/auth', authLimiter);
app.use('/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/institutions', institutionsRoutes);
app.use('/api/specialties', specialtiesRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/test', testRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/admin', adminRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});