# KrishiMitra AI

Minimal MERN crop recommendation app for farmers.

## Features

1. **Home dashboard** — intro + quick links
2. **OTP authentication** — register, request OTP, verify & login
3. **AI crop recommendation** — soil/weather inputs → top 3 crops
4. **Farming chatbot** — simple FAQ-style answers
5. **Voice assistance** — speak questions + hear replies (browser Web Speech API)

## Stack

- **MongoDB** + **Express** + **React (Vite)** + **Node.js**

## Setup

### 1. MongoDB

Start local MongoDB, or put your Atlas URI in `Backend/.env`:

```
MONGO_URI=mongodb://127.0.0.1:27017/krishimitra
```

### 2. Backend

```bash
cd Backend
npm install
npm run dev
```

API: `http://localhost:7000`

If SMTP is empty, OTP is printed in the **server console** and returned as `devOtp` for local testing.

Optional email OTP — set in `.env`:

```
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
```

### 3. Frontend

```bash
cd Frontend
npm install
npm run dev
```

App: `http://localhost:5173`

## How to use

1. Open the app → **Login** → **Register**
2. Login → **Send OTP** → enter OTP (check console if SMTP is off)
3. Go to **Crops** → enter N/P/K/pH/temp/humidity/rainfall → get top 3
4. Go to **Chat** → type or click **Speak**

## API routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/request-otp` | No | Send / generate OTP |
| POST | `/api/auth/verify-otp` | No | Verify OTP + session |
| POST | `/api/auth/logout` | Cookie | Logout |
| GET | `/api/auth/me` | Yes | Current user |
| POST | `/api/crops/recommend` | Yes | Top 3 crops |
| GET | `/api/crops/history` | Yes | Recent recommendations |
| POST | `/api/chat` | Yes | Chatbot reply |
