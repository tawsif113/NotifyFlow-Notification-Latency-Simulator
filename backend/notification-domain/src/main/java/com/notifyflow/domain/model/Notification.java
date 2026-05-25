package com.notifyflow.domain.model;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record Notification(
        UUID id,
        String tenantId,
        String eventType,
        String templateKey,
        Map<String, Object> variables,
        NotificationStatus status,
        Instant createdAt,
        Instant updatedAt
) {}
