# NotifyFlow Notification Simulation System

Event-driven notification simulation with Clean/Hexagonal backend and React simulation dashboard.

## Stack
- Backend: Java 25 + Spring Boot + Gradle (Groovy DSL)
- Frontend: React + Vite + TypeScript
- Broker: RabbitMQ
- Database: PostgreSQL
- Push: WebSocket/STOMP

## Project layout
- `backend/`
  - `notification-domain`
  - `notification-application`
  - `notification-infrastructure`
  - `notification-api`
  - `notification-bootstrap`
- `frontend/`
- `docs/`

## Backend build/run
```bash
cd backend
./gradlew clean build
docker compose up -d
./gradlew :notification-bootstrap:run
```

## Frontend build/run
```bash
cd frontend
npm install
npm run build
npm run dev
```

## API and WS contracts
- Health: `GET /actuator/health`
- Create notification: `POST /api/notification-requests`
- List deliveries: `GET /api/notification-requests/{notificationId}/deliveries`
- Mark read: `PATCH /api/deliveries/{deliveryId}/read`
- Mark unread: `PATCH /api/deliveries/{deliveryId}/unread`
- STOMP endpoint: `/ws`
- Topic pattern: `/topic/notifications/{tenantId}/{userId}`

Create notification body:
```json
{
  "tenantId": "demo-tenant",
  "eventType": "BROADCAST",
  "templateKey": "broadcast-template",
  "variables": {
    "title": "Hello",
    "body": "This is a simulation"
  },
  "userIds": ["user-1", "user-2", "user-3"]
}
```

## Verified in this environment
- `backend`: `./gradlew clean build` ✅
- `frontend`: `npm run build` ✅
- `docker compose config` for postgres/rabbitmq ✅

See `docs/verification.md` for end-to-end test flow.
