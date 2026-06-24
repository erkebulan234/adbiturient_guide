# ERD (Entity Relationship Diagram)

## Основные сущности

### Users

Хранение пользователей системы.

Поля:

- id
- name
- email
- password_hash
- role
- google_id
- created_at

---

### Profiles

Дополнительная информация об абитуриенте.

Поля:

- id
- user_id
- education_level
- city
- interests
- strengths

Связь:

User (1) → (1) Profile

---

### Institutions

Университеты Казахстана.

Поля:

- id
- name
- city
- type
- description

---

### Specialties

Специальности.

Поля:

- id
- institution_id
- code
- name
- description

Связь:

Institution (1) → (N) Specialties

---

### Programs

Образовательные программы.

Поля:

- id
- specialty_id
- degree
- tuition_fee
- grant_score
- duration

Связь:

Specialty (1) → (N) Programs

---

### Favorites

Избранные программы пользователя.

Поля:

- id
- user_id
- program_id

Связь:

User (1) → (N) Favorites

Program (1) → (N) Favorites

---

### Tests

Результаты тестирования.

Поля:

- id
- user_id
- result
- created_at

---

### Recommendations

Рекомендации пользователю.

Поля:

- id
- user_id
- program_id
- explanation
- score

---

## Общая схема

```

Users
│
├── Profile
├── Tests
├── Favorites
└── Recommendations
                │
                ▼
Programs
│
▼
Specialties
│
▼
Institutions

```