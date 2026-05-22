# Store Rating Platform

Full-stack store rating application with role-based access control (Admin, Normal User, Store Owner).

## Tech Stack

- **Frontend:** React 18 (functional components, hooks), React Router, Context API
- **Backend:** Express.js, JWT authentication
- **Database:** PostgreSQL

## Project Structure

```
store-rating-platform/
├── backend/          # Express REST API
│   └── src/
│       ├── db/       # Schema, migrations, seed
│       ├── routes/   # API endpoints
│       └── middleware/
└── frontend/         # React + Vite
    └── src/
        ├── context/  # Auth state (Context API)
        ├── pages/    # Role-based views
        └── components/
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE store_rating_db;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

npm install
npm run db:init
npm run db:seed
npm run dev
```

Default admin credentials (after seed):
- **Email:** admin@storeplatform.com
- **Password:** Admin@123

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Normal user signup |
| POST | /api/auth/login | Public | Login (all roles) |
| POST | /api/auth/logout | Auth | Logout |
| PUT | /api/auth/password | Auth | Change password |
| GET | /api/admin/dashboard | Admin | Stats counts |
| GET/POST/PUT/DELETE | /api/admin/users | Admin | User CRUD |
| GET/POST/PUT/DELETE | /api/admin/stores | Admin | Store CRUD |
| GET | /api/stores | User | List stores + ratings |
| POST/PUT | /api/ratings | User | Submit/update rating |
| GET | /api/owner/dashboard | Store Owner | Store stats + raters |

## Validation Rules

| Field | Rules |
|-------|-------|
| Name | 20–60 characters |
| Address | Max 400 characters |
| Password | 8–16 chars, 1 uppercase, 1 special character |
| Email | Standard email format |
| Rating | 1–5 integer |

## Roles & Features

### System Administrator
- Dashboard with total users, stores, ratings
- CRUD users (admin, user, store owner) and stores
- Search/filter users by name, email, address, role
- Sort tables by name/email (asc/desc)
- View store owner details with store average rating

### Normal User
- Registration and login
- Browse/search stores by name or address
- Submit and update ratings (1–5)
- See overall rating and personal rating per store

### Store Owner
- Dashboard with average rating and list of raters
- Change password
- Sort rater list by name/email

## Environment Variables

**backend/.env**
```
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/store_rating_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
```
# Roxiler_Systems_Task
