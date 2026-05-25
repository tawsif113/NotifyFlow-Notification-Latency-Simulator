# NotifyFlow verification checklist

## CORS

- Config: `backend/notification-bootstrap/src/main/java/com/notifyflow/bootstrap/config/CorsConfig.java`
- Allows all origins, headers, and methods for local simulation.

## RabbitMQ

- Exchange: `notifyflow.notifications.exchange`
- Queue: `notifyflow.notifications.queue`
- Routing key: `notifyflow.notifications.created`

## Visual docs

- Architecture image: `docs/assets/architecture.svg`
- Delivery flow image: `docs/assets/delivery-flow.svg`

## End-to-end validation steps

1. Start infra:
   - `cd backend && docker compose up -d`
2. Start backend:
   - `./gradlew :notification-bootstrap:run`
3. Start frontend:
   - `cd ../frontend && npm run dev`
4. In the UI:
   - set user count `N`
   - click `Send broadcast`
5. Confirm:
   - notification persisted in PostgreSQL (`notifications`, `notification_deliveries`)
   - RabbitMQ queue receives and consumes the message
   - each user lane receives STOMP push
   - latency appears per lane
   - fastest / slowest / average update

## Quick curl test

```bash
curl -sS http://localhost:8080/actuator/health

curl -sS -X POST http://localhost:8080/api/notification-requests \
  -H 'Content-Type: application/json' \
  -d '{
    "tenantId": "demo-tenant",
    "eventType": "BROADCAST",
    "templateKey": "broadcast-template",
    "variables": {"title": "Demo", "body": "Ping"},
    "userIds": ["user-1", "user-2", "user-3"]
  }'
```
