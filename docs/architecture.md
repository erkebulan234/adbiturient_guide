# Архитектура проекта

Проект реализован по многослойной архитектуре.

## Слои

### Controllers

Принимают HTTP-запросы и формируют ответы.

### Services

Содержат бизнес-логику.

### Repositories

Работают с базой данных.

### Database

PostgreSQL.

---

## Схема

```
React
↓
Routes
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

## Принципы

- Separation of Concerns
- Single Responsibility Principle
- Dependency Injection
- Repository Pattern
- Service Layer Pattern