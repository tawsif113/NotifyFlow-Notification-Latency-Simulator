# NotifyFlow backend

Multi-module Spring Boot backend for event-driven notification simulation.

## Modules
- notification-domain: pure domain model
- notification-application: use cases + ports
- notification-infrastructure: adapters (Postgres/RabbitMQ/WebSocket push)
- notification-api: REST controllers + DTOs
- notification-bootstrap: app runtime wiring

## Run infra
```bash
docker compose up -d
```

## Build
```bash
cd /home/kazimtr/projects/startup/notificationsystem/backend
./gradlew clean build
```

## Start backend
```bash
./gradlew :notification-bootstrap:bootRun
```

## API
- `POST /api/notification-requests`
- `GET /api/notification-requests/{notificationId}/deliveries`
- `PATCH /api/deliveries/{deliveryId}/read`
- `PATCH /api/deliveries/{deliveryId}/unread`

Sample create request:
```json
{
  "tenantId": "demo-tenant",
  "eventType": "BROADCAST",
  "templateKey": "broadcast-template",
  "variables": {"title": "Hello", "body": "Ping"},
  "userIds": ["user-1","user-2"]
}
```

WebSocket endpoint:
- `/ws` (SockJS + WS)
- topic pattern: `/topic/notifications/{tenantId}/{userId}`
