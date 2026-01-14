# MiniCRM для SMM-агенції «SMM Pulse»

## Опис проєкту
MiniCRM — це компактна CRM-система для SMM-агенції «SMM Pulse», яка допомагає:
- вести ліди та клієнтів;
- керувати угодами (контракти на SMM-пакети);
- фіксувати задачі по контенту;
- додавати нотатки;
- переглядати аналітику: воронка, дохід, конверсія, топ-джерела, активність менеджера.

Проєкт реалізований на **React + Node.js (Express) + SQLite** із чистим CSS у темній мінімалістичній стилістиці.

## Структура папок
```
client/           # React (Vite) фронтенд
server/           # Express + SQLite бекенд
```

## Команди запуску
### Backend
```bash
cd server
cp .env.example .env
npm install
npm run init-db
npm run start
```

### Frontend
```bash
cd client
npm install
npm run dev
```

> Після запуску відкрийте: `http://localhost:5173`

## .env приклад
```env
PORT=4000
JWT_SECRET=super_secret_key
```

## База даних (SQLite)
SQL-схема знаходиться у `server/db/schema.sql`, seed-дані — у `server/db/seed.sql`.

### Таблиці
- **users** — користувачі (admin/manager)
- **leads** — ліди
- **deals** — угоди
- **tasks** — контент-задачі
- **notes** — нотатки

## API (опис + реалізація)
Базовий URL: `http://localhost:4000/api`

### Авторизація
- `POST /auth/login`

### Ліди
- `GET /leads`
- `POST /leads`
- `PUT /leads/:id`
- `DELETE /leads/:id`
- `POST /leads/:id/status`

### Угоди
- `GET /deals`
- `POST /deals`
- `PUT /deals/:id`
- `DELETE /deals/:id`

### Задачі
- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

### Нотатки
- `GET /notes`
- `POST /notes`

### Підтримка
- `POST /support`

### Аналітика
- `GET /analytics/kpi`
- `GET /analytics/funnel`
- `GET /analytics/revenue`
- `GET /analytics/sources`
- `GET /analytics/owners`

## Приклади запитів
### Логін
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smm-pulse.ua","password":"admin123"}'
```

### Отримати ліди
```bash
curl http://localhost:4000/api/leads \
  -H "Authorization: Bearer <TOKEN>"
```

### Створити угоду
```bash
curl -X POST http://localhost:4000/api/deals \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"leadId":5,"package":"SMM Pro","price":24000,"startDate":"2024-01-10","endDate":"2024-04-10","dealStatus":"Active"}'
```

### Звернення до підтримки
```bash
curl -X POST http://localhost:4000/api/support \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Іван","email":"ivan@example.com","subject":"Проблема з доступом","message":"Не бачу дані у воронці."}'
```

### Axios приклад
```js
import api from './api';

const login = async () => {
  const { data } = await api.post('/auth/login', {
    email: 'manager@smm-pulse.ua',
    password: 'manager123'
  });
  localStorage.setItem('token', data.token);
};
```

## UI сторінки
- Вхід
- Дашборд (KPI + останні ліди)
- Ліди (таблиця + фільтри + створення)
- Угоди
- Задачі (колонки)
- Аналітика (графіки)
- Налаштування (профіль користувача, вихід)

## UML (текстовий опис)
### Use Case діаграма
**Актори:**
- Менеджер
- Адміністратор

**Варіанти використання:**
- Авторизація
- Перегляд/створення/редагування/видалення лідів
- Зміна статусу ліда (воронка)
- Створення угоди з виграного ліда
- Перегляд/редагування угод
- Створення та управління контент-задачами
- Додавання нотаток до ліда або угоди
- Перегляд аналітики (KPI, воронка, дохід, джерела, активність менеджерів)

### Діаграма класів/компонентів
- **User** (id, name, email, password, role)
- **Lead** (id, name, contact, source, status, estimatedBudget, ownerId, createdAt)
- **Deal** (id, leadId, package, price, startDate, endDate, dealStatus, createdAt)
- **Task** (id, dealId, title, type, status, dueDate, createdAt)
- **Note** (id, entityType, entityId, text, createdAt, authorId)
- **AnalyticsService** (getKPI, getFunnel, getRevenue, getSources, getOwners)
- **LeadController**, **DealController**, **TaskController**, **NoteController**

## Як продемонструвати на захисті (сценарій 3–5 хв)
1. Увійти під менеджером та показати дашборд з KPI.
2. Відкрити «Ліди», показати фільтри та зміну статусу воронки.
3. Перейти в «Угоди» та створити угоду з виграного ліда.
4. Відкрити «Задачі», продемонструвати колонки та переміщення задач між статусами.
5. Перейти в «Аналітику» і показати графіки (воронка, дохід, джерела).
6. В «Налаштуваннях» продемонструвати профіль та вихід.
