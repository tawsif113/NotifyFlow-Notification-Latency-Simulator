package com.notifyflow.application.port.in;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface SendNotificationUseCase {
    NotificationResult send(Command command);

    record Command(String tenantId, String eventType, String templateKey, Map<String, Object> variables, List<String> userIds) {}
    record NotificationResult(UUID id, String status, String createdAt) {}
}
