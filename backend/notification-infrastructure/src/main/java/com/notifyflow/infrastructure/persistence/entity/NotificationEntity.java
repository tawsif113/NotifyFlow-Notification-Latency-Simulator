package com.notifyflow.infrastructure.persistence.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class NotificationEntity {
    @Id
    private UUID id;
    private String tenantId;
    private String eventType;
    private String templateKey;
    @Column(columnDefinition = "text")
    private String variablesJson;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getTemplateKey() { return templateKey; }
    public void setTemplateKey(String templateKey) { this.templateKey = templateKey; }
    public String getVariablesJson() { return variablesJson; }
    public void setVariablesJson(String variablesJson) { this.variablesJson = variablesJson; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
