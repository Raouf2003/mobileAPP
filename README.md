# Full-Stack JWT Authentication

Node.js + Express API with MongoDB Atlas, and a React Native (Expo) mobile client.

## Folder structure

```
newAPP/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   └── authController.js  # register, login, profile
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT protect middleware
│   ├── models/
│   │   └── User.js            # Mongoose user schema
│   ├── routes/
│   │   └── authRoutes.js      # /api/auth routes
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── mobile/
│   ├── app/
│   │   ├── _layout.tsx        # AuthProvider + navigation
│   │   ├── index.tsx          # Auto-login redirect
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── home.tsx           # Protected screen
│   ├── components/
│   │   └── AuthForm.tsx
│   ├── constants/
│   │   └── config.ts          # API URL
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   ├── api.ts             # Axios + interceptors
│   │   └── storage.ts         # Expo SecureStore
│   ├── .env.example
│   ├── app.json
│   └── package.json
└── README.md
```

## API endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/profile` | Bearer JWT | Protected profile |
| GET | `/health` | No | Health check |

---

## Backend setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` (already configured if you use the provided Atlas URI):

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=30d
```

### 3. Run the server

```bash
npm run dev
# or
npm start
```

Server runs at `http://localhost:5000` locally.

Test:

```bash
curl http://localhost:5000/health
```

---

## Deploy to the internet

**Full guide:** see [DEPLOY.md](./DEPLOY.md)

Quick summary:

1. Allow **0.0.0.0/0** in MongoDB Atlas → Network Access.
2. Push repo to **GitHub** (do not commit `.env` files).
3. Deploy **`backend`** on [Render](https://render.com) (root dir `backend`, start `npm start`, health `/health`).
4. Set env vars: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=30d`.
5. Set `mobile/.env`: `EXPO_PUBLIC_API_URL=https://YOUR-APP.onrender.com/api/auth`
6. Run `npx expo start -c` on the phone build.

Your public API base URL:

`https://your-app.onrender.com/api/auth`

---

## Mobile app setup

**Expo SDK 56** (React Native 0.85, React 19.2)

### 1. Install dependencies

```bash
cd mobile
npm install
```

### 2. Set API URL

Edit `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=https://YOUR-BACKEND-URL/api/auth
```

Replace `YOUR-BACKEND-URL` with your deployed host (no trailing slash before `/api`).

Example:

```env
EXPO_PUBLIC_API_URL=https://auth-api.onrender.com/api/auth
```

Restart Expo after changing `.env`:

```bash
npx expo start -c
```

### 3. Run the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone (same Wi‑Fi not required if using the deployed API URL).

---

## How it works

1. **Register / Login** — API hashes passwords with bcrypt, returns a JWT (30-day expiry).
2. **SecureStore** — Token and user saved on device via `expo-secure-store`.
3. **Auto-login** — On launch, stored token is loaded and `/profile` is called.
4. **Protected routes** — Axios sends `Authorization: Bearer <token>`.
5. **Logout** — Clears SecureStore and redirects to login.

---

## Production improvements

| Area | Recommendation |
|------|----------------|
| **Secrets** | Never commit `.env`. Rotate `JWT_SECRET` and DB password. Use host secret managers. |
| **HTTPS** | Enforce TLS on API; mobile only talks to `https://` URLs. |
| **Validation** | Add `express-validator` or Zod on request bodies. |
| **Rate limiting** | `express-rate-limit` on `/login` and `/register`. |
| **Refresh tokens** | Short-lived access token + refresh token in httpOnly cookie or secure rotation. |
| **CORS** | Restrict `cors()` to your app origins in production. |
| **Logging** | Structured logs (Winston/Pino) + error monitoring (Sentry). |
| **Indexes** | `username` is unique in schema; ensure Atlas indexes match. |
| **Helmet** | Security headers via `helmet`. |
| **Password policy** | Stronger rules, optional email verification. |
| **Scaling** | Stateless JWT API scales horizontally; use MongoDB Atlas replica sets. |

---

## Example API requests

**Register**

```bash
curl -X POST https://YOUR-BACKEND-URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"john\",\"password\":\"secret123\"}"
```

**Login**

```bash
curl -X POST https://YOUR-BACKEND-URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"john\",\"password\":\"secret123\"}"
```

**Profile**

```bash
curl https://YOUR-BACKEND-URL/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
