# Deploy to the Internet

Deploy the **backend** to a public HTTPS host. The **mobile app** stays on your phone (Expo); it only needs the public API URL.

MongoDB is already on **MongoDB Atlas** — no extra database deploy.

---

## Step 1 — Prepare MongoDB Atlas

1. Open [MongoDB Atlas](https://cloud.mongodb.com) → your cluster.
2. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).  
   Required so Render/Railway can connect. For stricter security, add only your host’s IPs later.
3. **Database Access** — ensure your DB user/password work (use the connection string in `MONGODB_URI`).
4. Copy your connection string, e.g.  
   `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/testlogin?retryWrites=true&w=majority`

**Security:** Rotate your DB password if it was ever shared or committed to git.

---

## Step 2 — Push code to GitHub

```powershell
cd C:\Users\Ciprox\Desktop\newAPP
git init
git add backend mobile README.md DEPLOY.md .gitignore
git commit -m "Auth app backend and Expo mobile client"
```

Create a repo on GitHub, then:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Do **not** commit `backend/.env` or `mobile/.env` (they are in `.gitignore`).

---

## Step 3 — Deploy backend on Render (recommended, free tier)

1. Sign up at [render.com](https://render.com).
2. **New** → **Web Service** → connect your GitHub repo.
3. Settings:
   | Field | Value |
   |--------|--------|
   | **Root Directory** | `backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Health Check Path** | `/health` |

4. **Environment** → add variables:

   | Key | Value |
   |-----|--------|
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | long random string (32+ chars) |
   | `JWT_EXPIRES_IN` | `30d` |
   | `NODE_VERSION` | `20` |

   Render sets `PORT` automatically — do not hardcode it.

5. **Create Web Service** and wait until status is **Live**.

6. Your API base URL will look like:
   ```text
   https://auth-api-xxxx.onrender.com
   ```

7. Test in a browser or terminal:
   ```powershell
   curl https://YOUR-SERVICE.onrender.com/health
   ```

   Auth routes:
   - `POST https://YOUR-SERVICE.onrender.com/api/auth/register`
   - `POST https://YOUR-SERVICE.onrender.com/api/auth/login`
   - `GET  https://YOUR-SERVICE.onrender.com/api/auth/profile`

**Note:** Free Render services sleep after ~15 min idle; the first request may take 30–60 seconds (cold start).

---

## Step 4 — Point the mobile app to production

Edit `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=https://YOUR-SERVICE.onrender.com/api/auth
```

Restart Expo with a clean cache:

```powershell
cd C:\Users\Ciprox\Desktop\newAPP\mobile
npx expo start -c
```

Remove local-only HTTP settings when you ship to stores (see below).

---

## Step 5 — Test on your phone

1. Backend live on Render.
2. `EXPO_PUBLIC_API_URL` uses **https** (not `http`, not `localhost`).
3. Register → Login → Home should work from any network (Wi‑Fi or mobile data).

---

## Alternative: Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**.
2. Set root to `backend` (or deploy only the `backend` folder).
3. Add the same env vars: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`.
4. Open **Settings** → generate a public domain → use that URL in `mobile/.env`.

---

## Production mobile app (optional)

For App Store / Play Store, build with [EAS Build](https://docs.expo.dev/build/introduction/):

```powershell
cd mobile
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
```

Set `EXPO_PUBLIC_API_URL` in [EAS environment variables](https://docs.expo.dev/eas/environment-variables/) or in `eas.json` so production builds use your Render URL.

Before store release, in `mobile/app.json` remove dev-only options:
- `android.usesCleartextTraffic`
- `ios.infoPlist.NSAppTransportSecurity` (use HTTPS only)

---

## Checklist

- [ ] Atlas allows `0.0.0.0/0` (or host IPs)
- [ ] Backend deployed; `/health` returns JSON
- [ ] `JWT_SECRET` set on host (not the default from local `.env`)
- [ ] `mobile/.env` → `https://YOUR-SERVICE.onrender.com/api/auth`
- [ ] `npx expo start -c` after changing `.env`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Network Error on phone | Wrong `EXPO_PUBLIC_API_URL` or backend asleep (retry / upgrade plan) |
| 500 on register/login | Check Render **Logs**; usually bad `MONGODB_URI` |
| MongoDB timeout | Atlas Network Access must allow cloud IPs |
| CORS errors (web only) | Backend already uses `cors()` for all origins |
