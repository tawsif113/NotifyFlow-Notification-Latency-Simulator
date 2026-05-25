package com.notifyflow.domain.model;

import java.time.Instant;
import java.util.UUID;

public record NotificationDelivery(
        UUID id,
        UUID notificationId,
        String tenantId,
        String userId,
        DeliveryStatus status,
        Instant createdAt,
        Instant deliveredAt,
        Instant readAt,
        Long latencyMs
) {}
