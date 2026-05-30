# Навигатор абитуриента

Интеллектуальная информационная система поддержки абитуриентов в процессе профессионального самоопределения.

Система помогает абитуриентам после 9 и 11 класса выбрать подходящую специальность, колледж или университет на основе анкеты, интересов, любимых предметов, навыков и результатов профориентационного теста.

## Возможности

- регистрация и авторизация пользователей;
- роли пользователя и администратора;
- заполнение анкеты абитуриента;
- профориентационный тест;
- генерация рекомендаций;
- объяснение причины рекомендации;
- каталог колледжей, университетов и образовательных программ;
- отображение стоимости обучения, документов, сроков, предметов и востребованности;
- административная панель;
- добавление, редактирование и удаление заведений, специальностей и программ;
- защита от дублирования данных.

## Технологии

### Frontend

- React
- React Router
- Axios
- Vite
- CSS

### Backend

- Node.js
- Express
- JWT
- bcryptjs
- PostgreSQL
- pg

### База данных

- PostgreSQL

## Структура проекта

```text
abiturient_guide/
  backend/
    database/
      schema.sql
      seed.sql
      test_seed.sql
    src/
      config/
      controllers/
      middleware/
      routes/
      services/
    server.js
    package.json

  frontend/
    src/
      api/
      components/
      context/
      pages/
      styles/
    index.html
    package.json
```

## Запуск backend

```bash
cd backend
npm install
npm start
```

Перед запуском нужно создать файл `.env` в папке `backend`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/abiturient_guide
JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=7d
```

Проверка backend:

```text
http://localhost:5000/health
```

## Запуск frontend

```bash
cd frontend
npm install
npm start
```

Открыть сайт:

```text
http://localhost:5173
```

## Создание базы данных

В PostgreSQL создать базу:

```sql
CREATE DATABASE abiturient_guide;
```

Подключиться к базе:

```sql
\c abiturient_guide
```

Выполнить SQL-файлы:

```sql
\i 'C:/projects/abiturient_guide/backend/database/schema.sql'
\i 'C:/projects/abiturient_guide/backend/database/seed.sql'
\i 'C:/projects/abiturient_guide/backend/database/test_seed.sql'
```

## Основные API

### Авторизация

```http
POST /auth/register
POST /auth/login
```

### Анкета

```http
GET /api/profile
POST /api/profile
PUT /api/profile
```

### Тестирование

```http
GET /api/test
GET /api/test/:id
POST /api/test/:id/submit
GET /api/test/results
```

### Рекомендации

```http
POST /api/recommendations/generate
GET /api/recommendations
```

### Каталог

```http
GET /api/institutions
GET /api/specialties
GET /api/programs
```

### Админ-панель

```http
GET /admin/stats
POST /admin/institutions
PUT /admin/institutions/:id
DELETE /admin/institutions/:id

POST /admin/specialties
PUT /admin/specialties/:id
DELETE /admin/specialties/:id

POST /admin/programs
PUT /admin/programs/:id
DELETE /admin/programs/:id
```

## Алгоритм рекомендаций

В системе используется rule-based рекомендательный алгоритм с весами.

Алгоритм учитывает:

- интересы пользователя;
- любимые предметы;
- навыки;
- результаты профориентационного теста;
- уровень поступления: после 9 или после 11 класса;
- город пользователя.

Результаты сортируются по проценту совпадения. Пользователь видит не только рекомендацию, но и причину, почему система выбрала это направление.
    

