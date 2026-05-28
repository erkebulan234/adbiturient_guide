# Abiturient Guide 🎓

Интеллектуальная система профориентации для абитуриентов Казахстана.

Помогает выбрать профессию, колледж или университет на основе интересов, достижений и результатов теста.

- После 9 класса → колледжи
- После 11 класса → университеты

## Стек

- **Frontend:** React + Tailwind CSS
- **Backend:** Node.js + Express
- **База данных:** PostgreSQL + Prisma ORM
- **Рекомендации:** Встроенный JS-модуль (cosine similarity + decision tree)

## Запуск

```bash
# Клонировать репозиторий
git clone https://github.com/erkebulan234/abiturient-guide.git
cd abiturient-guide

# Бэкенд
cd server
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev

# Фронтенд
cd ../client
cp .env.example .env
npm install
npm run dev
```

## Документация

См. [docs/architecture.md](docs/architecture.md)
