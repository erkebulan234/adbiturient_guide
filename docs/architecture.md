# Архитектура системы профориентации абитуриентов Казахстана

## 1. Общая схема

```
┌─────────────────────────────────────────────────┐
│                   CLIENT                        │
│              React (SPA)                        │
│   После 9 кл → колледжи  |  После 11 кл → вузы │
└─────────────────┬───────────────────────────────┘
                  │ HTTP / REST
┌─────────────────▼───────────────────────────────┐
│               Node.js (Express)                 │
│      Auth · API · Admin · Recommender Service   │
│                                                 │
│  services/recommender.js                        │
│    ├── rule-based фильтры                       │
│    ├── cosine similarity                        │
│    └── decision tree                            │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│                PostgreSQL                       │
│  Users · UserProfiles · Achievements            │
│  TestResults · Professions · Specialties        │
│  Institutions · Programs · Recommendations      │
└─────────────────────────────────────────────────┘
```

---

## 2. Технологический стек

| Слой | Технология | Назначение |
|------|-----------|-----------| 
| Frontend | React + React Router | SPA, маршрутизация |
| UI | Tailwind CSS | Адаптивная вёрстка |
| State | Redux Toolkit / Zustand | Глобальное состояние |
| Backend | Node.js + Express | REST API |
| Auth | JWT + bcrypt | Авторизация |
| ORM | Prisma | Работа с PostgreSQL |
| База данных | PostgreSQL | Хранение данных |
| ML (встроен) | `natural`, `ml-classify` (npm) | Cosine similarity, decision tree |
| Хранилище файлов | Multer + локальная папка | Загрузка грамот и документов |
| Деплой | Docker + docker-compose | Контейнеризация |
| VCS | Git + GitHub | Контроль версий |

> ML-логика реализована прямо в Node.js — отдельный Python-микросервис не нужен.  
> Для задачи (сравнение векторов интересов + правила фильтрации) возможностей npm-библиотек достаточно.

---

## 3. Логика рекомендаций

Система работает в два этапа:

```
Данные абитуриента
  ├── Профиль: класс (9 / 11), город, тип заведения, интересы
  ├── Достижения: оценки, олимпиады, сертификаты, балл ЕНТ
  └── Тест: тип личности (RIASEC), интересы, склонности
            │
            ▼
    Шаг 1 — Профессия
    recommender.js анализирует данные → топ профессий
    с процентом совпадения (match_score)
            │
            ▼
    Шаг 2 — Заведения и программы
    По профессии → специальности → программы
    Фильтрация: город, тип (вуз/колледж), балл ЕНТ, грант
            │
            ▼
    Результат — карточки учебных заведений с программами
```

**Класс абитуриента — ключевой фильтр:**
- 9 класс → `institution_type = 'college'` → Programs с `edu_level = 'secondary_vocational'`
- 11 класс → `institution_type = 'university'` → Programs с `edu_level = 'bachelor'`

**Алгоритм в `services/recommender.js`:**

1. **Rule-based фильтр** — отсекает программы не по городу, не по типу заведения и с `min_ent_score` выше балла абитуриента
2. **Cosine similarity** — сравнивает вектор интересов/предметов пользователя с вектором каждой специальности, считает `match_score`
3. **Бонусы за достижения** — олимпиада по профильному предмету +0.1, грамоты +0.05 к `match_score`
4. **Сортировка** — топ профессий по итоговому `match_score`, под каждой — отфильтрованные программы

```js
// Пример: cosine similarity в чистом JS (без внешних зависимостей)
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}
```

---

## 4. Эндпоинты API

### 4.1 Аутентификация — `/auth/*`

| Метод | Путь | Описание | Тело запроса |
|-------|------|----------|-------------|
| POST | `/auth/register` | Регистрация нового пользователя | `{ email, password, role? }` |
| POST | `/auth/login` | Вход в систему | `{ email, password }` |
| POST | `/auth/logout` | Выход (инвалидация токена) | — |
| POST | `/auth/refresh` | Обновление access-токена | `{ refreshToken }` |
| POST | `/auth/forgot-password` | Запрос ссылки для сброса пароля | `{ email }` |
| POST | `/auth/reset-password` | Установка нового пароля | `{ token, newPassword }` |

**Ответ `/auth/login`:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": 1, "email": "user@mail.com", "role": "applicant" }
}
```

---

### 4.2 Профиль абитуриента — `/api/profile`

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/profile` | Получить профиль текущего пользователя |
| PUT | `/api/profile` | Обновить профиль |
| GET | `/api/profile/achievements` | Список достижений |
| POST | `/api/profile/achievements` | Добавить достижение |
| DELETE | `/api/profile/achievements/:id` | Удалить достижение |
| POST | `/api/profile/achievements/:id/upload` | Загрузить документ (грамота, сертификат) |

**Тело PUT `/api/profile`:**
```json
{
  "full_name": "Аманов Жансұлтан",
  "city": "Алматы",
  "education_level": "grade_9",
  "institution_type_pref": "college",
  "interests": ["IT", "математика"],
  "favorite_subjects": ["физика", "информатика"],
  "birth_year": 2009
}
```

**Тело POST `/api/profile/achievements`:**
```json
{
  "type": "olympiad",
  "title": "Городская олимпиада по математике",
  "grade": 9,
  "subject": "математика"
}
```

---

### 4.3 Тестирование — `/api/test`

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/test` | Список доступных тестов |
| GET | `/api/test/:id` | Вопросы конкретного теста |
| POST | `/api/test/:id/submit` | Отправить ответы и получить результат |
| GET | `/api/test/results` | История прохождений пользователя |
| GET | `/api/test/results/:id` | Детали одного результата |

**Тело POST `/api/test/:id/submit`:**
```json
{
  "answers": [
    { "question_id": 1, "value": "A" },
    { "question_id": 2, "value": "4" }
  ]
}
```

**Ответ:**
```json
{
  "result_id": 42,
  "personality_type": "INVESTIGATIVE",
  "total_score": 78,
  "top_spheres": ["IT", "инженерия", "наука"]
}
```

---

### 4.4 Специальности — `/api/specialties`

| Метод | Путь | Описание | Query-параметры |
|-------|------|----------|----------------|
| GET | `/api/specialties` | Список специальностей | `sphere`, `edu_level`, `search` |
| GET | `/api/specialties/:id` | Детали специальности | — |

**Пример запроса:**
```
GET /api/specialties?sphere=IT&edu_level=bachelor&search=программ
```

**Пример ответа:**
```json
[
  {
    "id": 5,
    "name": "Информационные системы",
    "code": "6B06101",
    "sphere": "IT",
    "edu_level": "bachelor",
    "description": "...",
    "required_subjects": ["математика", "физика или информатика"]
  }
]
```

---

### 4.5 Учебные заведения — `/api/institutions`

| Метод | Путь | Описание | Query-параметры |
|-------|------|----------|----------------|
| GET | `/api/institutions` | Список заведений с фильтрами | `city`, `type`, `min_ent_score`, `has_grant`, `search` |
| GET | `/api/institutions/:id` | Детали заведения | — |
| GET | `/api/institutions/:id/programs` | Программы конкретного заведения | `specialty_id`, `has_grant` |

**Пример запроса:**
```
GET /api/institutions?city=Алматы&type=university&min_ent_score=90&has_grant=true
```

**Пример ответа:**
```json
[
  {
    "id": 3,
    "name": "Казахский национальный университет им. аль-Фараби",
    "type": "university",
    "city": "Алматы",
    "website": "https://kaznu.kz",
    "accreditation": "IQAA"
  }
]
```

---

### 4.6 Программы обучения — `/api/programs`

| Метод | Путь | Описание | Query-параметры |
|-------|------|----------|----------------|
| GET | `/api/programs` | Список программ с фильтрами | `specialty_id`, `institution_id`, `has_grant`, `min_score`, `study_form`, `language` |
| GET | `/api/programs/:id` | Детали программы | — |

**Пример ответа:**
```json
{
  "id": 12,
  "specialty": { "id": 5, "name": "Информационные системы" },
  "institution": { "id": 3, "name": "КазНУ им. аль-Фараби" },
  "study_form": "full_time",
  "min_ent_score": 85,
  "tuition_cost": 650000,
  "has_grant": true,
  "duration_years": 4,
  "language": "казахский"
}
```

---

### 4.7 Рекомендации — `/api/recommendations`

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/recommendations/generate` | Запустить генерацию рекомендаций |
| GET | `/api/recommendations` | Получить последние рекомендации |
| GET | `/api/recommendations/:id` | Детали одной рекомендации |

**Тело POST `/api/recommendations/generate`:**
```json
{
  "test_result_id": 42
}
```

**Ответ:**
```json
{
  "professions": [
    {
      "profession": { "id": 7, "name": "Разработчик ПО", "sphere": "IT" },
      "match_score": 0.92,
      "match_reason": "Совпадение по интересам (IT), достижениям (олимпиада по информатике) и типу личности (INVESTIGATIVE)",
      "programs": [
        {
          "program_id": 12,
          "institution": "КазНУ им. аль-Фараби",
          "specialty": "Информационные системы",
          "min_ent_score": 85,
          "has_grant": true,
          "tuition_cost": 650000
        }
      ]
    }
  ]
}
```

---

### 4.8 Административная панель — `/admin/*`

> Все маршруты защищены: требуют `role = 'admin'`.

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/admin/stats` | Общая статистика (пользователи, тесты, рекомендации) |
| GET | `/admin/users` | Список всех пользователей |
| GET | `/admin/users/:id` | Профиль пользователя |
| DELETE | `/admin/users/:id` | Удалить пользователя |
| GET | `/admin/institutions` | Все заведения |
| POST | `/admin/institutions` | Добавить заведение |
| PUT | `/admin/institutions/:id` | Редактировать заведение |
| DELETE | `/admin/institutions/:id` | Удалить заведение |
| GET | `/admin/programs` | Все программы |
| POST | `/admin/programs` | Добавить программу |
| PUT | `/admin/programs/:id` | Редактировать программу |
| DELETE | `/admin/programs/:id` | Удалить программу |
| GET | `/admin/specialties` | Все специальности |
| POST | `/admin/specialties` | Добавить специальность |
| PUT | `/admin/specialties/:id` | Редактировать специальность |
| GET | `/admin/tests` | Все тесты |
| POST | `/admin/tests` | Создать тест |
| PUT | `/admin/tests/:id` | Редактировать тест (вопросы, варианты) |
| DELETE | `/admin/tests/:id` | Удалить тест |

---

## 5. Структура проекта

```
/
├── client/                        # React-приложение
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Auth/              # Регистрация, вход, восстановление
│   │   │   ├── Profile/           # Профиль, достижения
│   │   │   ├── Test/              # Прохождение теста
│   │   │   ├── Results/           # Рекомендации
│   │   │   └── Admin/             # Админ-панель
│   │   ├── components/
│   │   ├── store/                 # Redux / Zustand
│   │   └── api/                   # axios-инстансы
│   └── package.json
│
├── server/                        # Node.js (Express)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── test.js
│   │   ├── specialties.js
│   │   ├── institutions.js
│   │   ├── programs.js
│   │   ├── recommendations.js
│   │   └── admin.js
│   ├── services/
│   │   └── recommender.js         # Вся ML-логика (cosine, decision tree, rules)
│   ├── middleware/
│   │   ├── auth.js                # JWT-верификация
│   │   └── role.js                # Проверка роли
│   ├── prisma/
│   │   └── schema.prisma          # Схема БД
│   └── package.json
│
├── docs/
│   └── architecture.md            # Этот файл
│
└── docker-compose.yml             # Только два контейнера: app + postgres
```

---

## 6. Безопасность

- Все защищённые маршруты требуют заголовок `Authorization: Bearer <token>`
- Пароли хешируются через `bcrypt` (saltRounds = 12)
- Загружаемые файлы (грамоты) проверяются по типу (pdf, jpg, png) и ограничены по размеру (5 МБ)
- Роли: `applicant` (абитуриент), `admin`
