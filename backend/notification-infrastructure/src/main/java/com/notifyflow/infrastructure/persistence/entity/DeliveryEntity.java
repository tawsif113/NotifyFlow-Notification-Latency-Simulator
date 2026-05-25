package com.notifyflow.infrastructure.persistence.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notification_deliveries")
public class DeliveryEntity {
    @Id
    private UUID id;
    private UUID notificationId;
    private String tenantId;
    private String userId;
    private String status;
    private Instant createdAt;
    private Instant deliveredAt;
    private Instant readAt;
    private Long latencyMs;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getNotificationId() { return notificationId; }
    public void setNotificationId(UUID notificationId) { this.notificationId = notificationId; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(Instant deliveredAt) { this.deliveredAt = deliveredAt; }
    public Instant getReadAt() { return readAt; }
    public void setReadAt(Instant readAt) { this.readAt = readAt; }
    public Long getLatencyMs() { return latencyMs; }
    public void setLatencyMs(Long latencyMs) { this.latencyMs = latencyMs; }
}
