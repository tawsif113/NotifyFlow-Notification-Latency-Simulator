package com.notifyflow.infrastructure.realtime;

import com.notifyflow.application.port.out.RealtimePushPort;
import com.notifyflow.domain.model.NotificationDelivery;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

@Component
public class StompPushAdapter implements RealtimePushPort {
    private final SimpMessagingTemplate template;

    public StompPushAdapter(SimpMessagingTemplate template) {
        this.template = template;
    }

    @Override
    public void push(NotificationDelivery delivery, String title, String body, String notificationId) {
        var topic = "/topic/notifications/%s/%s".formatted(delivery.tenantId(), delivery.userId());
        var payload = Map.<String, Object>of(
                "deliveryId", delivery.id().toString(),
                "notificationRequestId", notificationId,
                "tenantId", delivery.tenantId(),
                "userId", delivery.userId(),
                "status", delivery.status().name(),
                "title", title,
                "body", body,
                "latencyMs", delivery.latencyMs(),
                "createdAt", delivery.createdAt().toString(),
                "deliveredAt", delivery.deliveredAt() != null ? delivery.deliveredAt().toString() : Instant.now().toString()
        );
        template.convertAndSend(topic, payload);
    }
}
