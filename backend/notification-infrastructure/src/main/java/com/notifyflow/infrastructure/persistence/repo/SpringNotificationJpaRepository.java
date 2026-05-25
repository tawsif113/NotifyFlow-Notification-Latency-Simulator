package com.notifyflow.infrastructure.persistence.repo;

import com.notifyflow.infrastructure.persistence.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SpringNotificationJpaRepository extends JpaRepository<NotificationEntity, UUID> {}
