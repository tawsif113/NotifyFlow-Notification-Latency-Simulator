package com.notifyflow.application.port.out;

import com.notifyflow.domain.model.NotificationDelivery;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeliveryRepositoryPort {
    NotificationDelivery save(NotificationDelivery delivery);
    Optional<NotificationDelivery> findById(UUID id);
    List<NotificationDelivery> findByNotificationId(UUID notificationId);
}
