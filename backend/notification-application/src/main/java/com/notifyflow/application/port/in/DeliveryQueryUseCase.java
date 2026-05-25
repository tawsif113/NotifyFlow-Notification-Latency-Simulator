package com.notifyflow.application.port.in;

import java.util.List;

public interface DeliveryQueryUseCase {
    List<DeliveryView> listByNotification(String notificationId);

    record DeliveryView(String id, String notificationId, String tenantId, String userId, String status, String createdAt, String deliveredAt, String readAt, Long latencyMs) {}
}
