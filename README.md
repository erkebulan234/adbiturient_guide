# 🎓 Abiturient Guide

AI-платформа для абитуриентов Казахстана, помогающая выбрать специальность, образовательную программу и университет на основе интересов пользователя, результатов профориентационного теста и предпочтений.

---

## Возможности

### Авторизация

- Регистрация
- Вход по email и паролю
- Google OAuth
- JWT-аутентификация

### Профиль пользователя

- Уровень образования
- Город
- Интересы
- Предпочтения

### Профориентационный тест

- Прохождение теста
- Сохранение результатов
- Анализ интересов

### Рекомендации

- Персонализированные рекомендации
- Объяснение причин выбора
- Ранжирование программ

### Каталог

- Университеты Казахстана
- Специальности
- Образовательные программы
- Поиск
- Фильтрация
- Пагинация

### Избранное

- Добавление программ
- Удаление программ
- Просмотр списка избранного

### Сравнение

- Сравнение нескольких образовательных программ

### Админ-панель

CRUD:

- университетов;
- специальностей;
- образовательных программ.

### API

Swagger-документация.

---

# Технологический стек

## Backend

- Node.js
- Express 5
- PostgreSQL
- JWT
- Google OAuth
- Zod
- Swagger
- Helmet
- Express Rate Limit
- Winston
- Vitest
- Supertest

## Frontend

- React 19
- Vite
- React Router
- Axios
- React Query
- Context API

---

# Архитектура

```
Frontend
↓
Controllers
↓
Services
↓
Repositories
↓
PostgreSQL
```

Проект реализован по принципам многослойной архитектуры.

---

# Структура проекта

```
abiturient_guide
│
├── backend
│   ├── database
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── repositories
│   │   ├── routes
│   │   ├── services
│   │   ├── validators
│   │   └── utils
│   │
│   └── tests
│
├── frontend
│   └── src
│       ├── api
│       ├── components
│       ├── context
│       ├── hooks
│       ├── pages
│       └── services
│
└── docs
```

---

# Запуск проекта

## Backend

```bash
cd backend

npm install

npm run dev
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Тестирование

```bash
npm test
```

Используются:

- Vitest
- Supertest

---

# API Documentation

Swagger:

```
http://localhost:5000/api-docs
```

---

# Лицензия

MIT License