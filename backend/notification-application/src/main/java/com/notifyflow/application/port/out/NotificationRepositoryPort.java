package com.notifyflow.application.port.out;

import com.notifyflow.domain.model.Notification;
import com.notifyflow.domain.model.NotificationStatus;

import java.util.Optional;
import java.util.UUID;

public interface NotificationRepositoryPort {
    Notification save(Notification notification);
    Optional<Notification> findById(UUID id);
    void updateStatus(UUID id, NotificationStatus status);
}
