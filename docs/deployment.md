# NotifyFlow deployment guide

This project has two deployable parts:

- Frontend: React + Vite static site
- Backend: Spring Boot API + realtime WebSocket service

The easiest production setup is to deploy them separately.

## 1) Docker / Docker Compose

Best when you want everything local or self-hosted in one place.

### Local stack

From the backend folder:

```bash
cd backend
docker compose up -d
```

Then start the backend:

```bash
./gradlew :notification-bootstrap:run
```

Then start the frontend:

```bash
cd ../frontend
npm install
npm run dev
```

### Production idea

Use one container for the backend and one container for the frontend build output, or serve the frontend as static files from your own web server.

Frontend environment variables:

```bash
VITE_API_BASE_URL=https://your-backend.example.com/api
VITE_WS_BASE_URL=wss://your-backend.example.com/ws
VITE_DEFAULT_TENANT_ID=demo-tenant
```

## 2) Render deployment

Recommended if you want a simple managed backend host.

### Backend service

1. Create a new Render Web Service from this repo.
2. Point the root directory to `backend/`.
3. Use a Java build/start command suitable for the Gradle project, for example:

```bash
./gradlew :notification-bootstrap:bootRun
```

or a production JAR launch if you package one.

4. Set any required environment variables for your database, RabbitMQ, and app profile.
5. Make sure the backend service can reach PostgreSQL and RabbitMQ.

### Frontend static site

1. Create a Render Static Site.
2. Point the root directory to `frontend/`.
3. Build command:

```bash
npm install && npm run build
```

4. Publish directory:

```bash
dist
```

5. Set frontend environment variables so the app can reach the backend:

```bash
VITE_API_BASE_URL=https://your-backend.example.com/api
VITE_WS_BASE_URL=wss://your-backend.example.com/ws
```

## 3) Cloudflare Pages

Best when you want a fast static frontend with edge delivery.

### Frontend deployment

1. Create a Cloudflare Pages project.
2. Set the root directory to `frontend/`.
3. Build command:

```bash
npm install && npm run build
```

4. Build output directory:

```bash
dist
```

5. Add environment variables in the Pages settings:

```bash
VITE_API_BASE_URL=https://your-backend.example.com/api
VITE_WS_BASE_URL=wss://your-backend.example.com/ws
```

### Backend deployment alongside Cloudflare

Deploy the backend separately on Render, Docker, Fly.io, or your own VM, then point Cloudflare Pages to that backend URL.

## Suggested production checklist

- Set the API URL correctly in frontend env vars
- Use HTTPS and WSS in production
- Confirm RabbitMQ and PostgreSQL are reachable from the backend
- Verify `/actuator/health`
- Confirm WebSocket/STOMP connectivity through `/ws`
- Test a broadcast end-to-end before announcing the deployment
