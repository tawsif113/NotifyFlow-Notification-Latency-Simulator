package com.notifyflow.domain.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record NotificationEvent(
        UUID notificationId,
        String tenantId,
        String eventType,
        String templateKey,
        Map<String, Object> variables,
        List<String> userIds,
        Instant publishedAt
) implements Serializable {}
