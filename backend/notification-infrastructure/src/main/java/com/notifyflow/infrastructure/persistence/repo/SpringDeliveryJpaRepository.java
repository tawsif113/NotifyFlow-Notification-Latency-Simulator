package com.notifyflow.infrastructure.persistence.repo;

import com.notifyflow.infrastructure.persistence.entity.DeliveryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringDeliveryJpaRepository extends JpaRepository<DeliveryEntity, UUID> {
    List<DeliveryEntity> findByNotificationId(UUID notificationId);
}
