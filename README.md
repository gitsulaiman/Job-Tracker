# Job Application Tracker

A full-stack MERN app for tracking job applications through Applied, Interview, Offer and Rejected stages — with its own account system, so each user only sees their own list.

**Live demo:** _add your Vercel link here_
**API:** _add your Render link here_

## Features

- Email/password accounts with JWT authentication — every application belongs to one user
- Add, edit, delete and filter applications by status
- Search by company or role, sort by date or company name
- Change an application's status inline from the list
- Live summary of total applications, interviews, offers and rejections
- Responsive, animated interface (React, Tailwind CSS, Framer Motion)

## Tech stack

**Frontend:** React (Vite), Tailwind CSS, Framer Motion
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt

## Project structure

```
Backend/    Express API + MongoDB models (User, Application)
Frontend/   React app (Vite)
```

## Running it locally

### Backend

```
cd Backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev
```

### Frontend

```
cd Frontend
npm install
npm run dev
```

The frontend expects the API at `http://localhost:5000` by default. To point it elsewhere, create a `.env` file in `Frontend` with:

```
VITE_API_URL=https://your-backend-url
```

## Environment variables (Backend)

| Variable      | Description                                  |
|---------------|-----------------------------------------------|
| `MONGO_URI`   | MongoDB Atlas connection string               |
| `PORT`        | Port the API runs on (defaults to 5000)       |
| `JWT_SECRET`  | Random string used to sign login tokens       |
