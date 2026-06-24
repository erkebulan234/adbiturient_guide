# База данных

Используется PostgreSQL.

## Основные сущности

### users

Хранение пользователей.

### profiles

Информация об абитуриенте.

### institutions

Университеты.

### specialties

Специальности.

### programs

Образовательные программы.

### favorites

Избранные программы.

### tests

Результаты тестов.

### recommendations

Персональные рекомендации.

---

## Связи

```
users
│
└── profiles

institutions
│
└── specialties
     │
     └── programs

users
│
├── favorites
├── tests
└── recommendations
```