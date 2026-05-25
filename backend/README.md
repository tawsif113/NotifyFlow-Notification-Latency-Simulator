# NotifyFlow backend

Multi-module Spring Boot backend for event-driven notification simulation.

![NotifyFlow backend architecture](../docs/assets/architecture.svg)

## Modules

- `notification-domain` — pure domain model
- `notification-application` — use cases and ports
- `notification-infrastructure` — adapters for PostgreSQL, RabbitMQ, and WebSocket push
- `notification-api` — REST controllers and DTOs
- `notification-bootstrap` — app runtime wiring and config

## Runtime flow

1. REST controller accepts the broadcast request.
2. Application service creates the domain object and delivery records.
3. Infrastructure adapters persist data and publish the event.
4. WebSocket/STOMP subscribers receive live delivery updates.

## Run infra

```bash
cd backend

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

## WebSocket endpoint

- `/ws` (SockJS + WS)
- topic pattern: `/topic/notifications/{tenantId}/{userId}`

### Sample create request

```json
{
  "tenantId": "demo-tenant",
  "eventType": "BROADCAST",
  "templateKey": "broadcast-template",
  "variables": {"title": "Hello", "body": "Ping"},
  "userIds": ["user-1", "user-2"]
}
```
