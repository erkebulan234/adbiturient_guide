# System Design

## Общая архитектура

```

Frontend (React)
↓
REST API (Express)
↓
Controllers
↓
Services
↓
Repositories
↓
PostgreSQL

```

---

## Frontend

Технологии:

- React 19
- Vite
- React Router
- React Query
- Axios

Основные страницы:

- Home
- Login
- Register
- Dashboard
- Profile
- Test
- Results
- Favorites
- Compare
- Institutions
- Programs
- Admin

---

## Backend

Технологии:

- Express
- PostgreSQL
- JWT
- Zod
- Swagger

Структура:

```

routes
↓
controllers
↓
services
↓
repositories
↓
database

```

---

## Recommendation Engine

Входные данные:

- интересы пользователя;
- результаты теста;
- профиль пользователя.

Алгоритм:

```

User Profile
+
Test Results
↓
Scoring
↓
Ranking
↓
Recommendations

```

Результат:

Список наиболее подходящих образовательных программ.

---

## Security Layer

Используются:

- JWT
- Helmet
- Rate Limiter
- CORS
- Error Handler
- Zod Validation

---

## Testing Layer

Unit Tests:

- services
- recommender

Integration Tests:

- controllers

API Tests:

- REST endpoints
```