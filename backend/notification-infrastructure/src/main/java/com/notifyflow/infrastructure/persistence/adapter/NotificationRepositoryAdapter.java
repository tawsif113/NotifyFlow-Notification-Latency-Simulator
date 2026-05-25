package com.notifyflow.infrastructure.persistence.adapter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.notifyflow.application.port.out.NotificationRepositoryPort;
import com.notifyflow.domain.model.Notification;
import com.notifyflow.domain.model.NotificationStatus;
import com.notifyflow.infrastructure.persistence.entity.NotificationEntity;
import com.notifyflow.infrastructure.persistence.repo.SpringNotificationJpaRepository;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
public class NotificationRepositoryAdapter implements NotificationRepositoryPort {
    private final SpringNotificationJpaRepository jpa;
    private final ObjectMapper objectMapper;

    public NotificationRepositoryAdapter(SpringNotificationJpaRepository jpa, ObjectMapper objectMapper) {
        this.jpa = jpa;
        this.objectMapper = objectMapper;
    }

    @Override
    public Notification save(Notification notification) {
        NotificationEntity e = toEntity(notification);
        return toDomain(jpa.save(e));
    }

    @Override
    public Optional<Notification> findById(UUID id) {
        return jpa.findById(id).map(this::toDomain);
    }

    @Override
    public void updateStatus(UUID id, NotificationStatus status) {
        jpa.findById(id).ifPresent(entity -> {
            entity.setStatus(status.name());
            entity.setUpdatedAt(java.time.Instant.now());
            jpa.save(entity);
        });
    }

    private NotificationEntity toEntity(Notification n) {
        NotificationEntity e = new NotificationEntity();
        e.setId(n.id());
        e.setTenantId(n.tenantId());
        e.setEventType(n.eventType());
        e.setTemplateKey(n.templateKey());
        try { e.setVariablesJson(objectMapper.writeValueAsString(n.variables())); } catch (Exception ex) { throw new IllegalStateException(ex); }
        e.setStatus(n.status().name());
        e.setCreatedAt(n.createdAt());
        e.setUpdatedAt(n.updatedAt());
        return e;
    }

    private Notification toDomain(NotificationEntity e) {
        try {
            Map<String, Object> vars = objectMapper.readValue(e.getVariablesJson(), new TypeReference<>() {});
            return new Notification(e.getId(), e.getTenantId(), e.getEventType(), e.getTemplateKey(), vars, NotificationStatus.valueOf(e.getStatus()), e.getCreatedAt(), e.getUpdatedAt());
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }
}
