package com.notifyflow.infrastructure.persistence.adapter;

import com.notifyflow.application.port.out.DeliveryRepositoryPort;
import com.notifyflow.domain.model.DeliveryStatus;
import com.notifyflow.domain.model.NotificationDelivery;
import com.notifyflow.infrastructure.persistence.entity.DeliveryEntity;
import com.notifyflow.infrastructure.persistence.repo.SpringDeliveryJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class DeliveryRepositoryAdapter implements DeliveryRepositoryPort {
    private final SpringDeliveryJpaRepository jpa;

    public DeliveryRepositoryAdapter(SpringDeliveryJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public NotificationDelivery save(NotificationDelivery d) {
        return toDomain(jpa.save(toEntity(d)));
    }

    @Override
    public Optional<NotificationDelivery> findById(UUID id) {
        return jpa.findById(id).map(this::toDomain);
    }

    @Override
    public List<NotificationDelivery> findByNotificationId(UUID notificationId) {
        return jpa.findByNotificationId(notificationId).stream().map(this::toDomain).toList();
    }

    private DeliveryEntity toEntity(NotificationDelivery d) {
        DeliveryEntity e = new DeliveryEntity();
        e.setId(d.id()); e.setNotificationId(d.notificationId()); e.setTenantId(d.tenantId()); e.setUserId(d.userId());
        e.setStatus(d.status().name()); e.setCreatedAt(d.createdAt()); e.setDeliveredAt(d.deliveredAt()); e.setReadAt(d.readAt()); e.setLatencyMs(d.latencyMs());
        return e;
    }

    private NotificationDelivery toDomain(DeliveryEntity e) {
        return new NotificationDelivery(e.getId(), e.getNotificationId(), e.getTenantId(), e.getUserId(), DeliveryStatus.valueOf(e.getStatus()), e.getCreatedAt(), e.getDeliveredAt(), e.getReadAt(), e.getLatencyMs());
    }
}
