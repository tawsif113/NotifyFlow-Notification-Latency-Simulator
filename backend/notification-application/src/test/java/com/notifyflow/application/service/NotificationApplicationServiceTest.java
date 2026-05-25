package com.notifyflow.application.service;

import com.notifyflow.application.port.in.SendNotificationUseCase;
import com.notifyflow.application.port.out.DeliveryRepositoryPort;
import com.notifyflow.application.port.out.NotificationEventPublisherPort;
import com.notifyflow.application.port.out.NotificationRepositoryPort;
import com.notifyflow.application.port.out.RealtimePushPort;
import com.notifyflow.domain.model.*;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class NotificationApplicationServiceTest {

    @Test
    void sendPublishesEventAndReturnsId() {
        InMemoryNotificationRepo notificationRepo = new InMemoryNotificationRepo();
        InMemoryDeliveryRepo deliveryRepo = new InMemoryDeliveryRepo();
        List<NotificationEvent> published = new ArrayList<>();

        NotificationApplicationService service = new NotificationApplicationService(
                notificationRepo,
                deliveryRepo,
                published::add,
                (delivery, title, body, notificationId) -> {},
                Runnable::run
        );

        var result = service.send(new SendNotificationUseCase.Command(
                "tenant-1",
                "BROADCAST",
                "tpl",
                Map.of("title", "Hello", "body", "Body"),
                List.of("u1", "u2")
        ));

        assertNotNull(result.id());
        assertEquals("PUBLISHED", result.status());
        assertEquals(1, published.size());
        assertEquals(2, published.getFirst().userIds().size());
    }

    static class InMemoryNotificationRepo implements NotificationRepositoryPort {
        final Map<UUID, Notification> store = new HashMap<>();

        @Override
        public Notification save(Notification notification) {
            store.put(notification.id(), notification);
            return notification;
        }

        @Override
        public Optional<Notification> findById(UUID id) {
            return Optional.ofNullable(store.get(id));
        }

        @Override
        public void updateStatus(UUID id, NotificationStatus status) {
            Notification existing = store.get(id);
            if (existing == null) return;
            store.put(id, new Notification(existing.id(), existing.tenantId(), existing.eventType(), existing.templateKey(), existing.variables(), status, existing.createdAt(), java.time.Instant.now()));
        }
    }

    static class InMemoryDeliveryRepo implements DeliveryRepositoryPort {
        final Map<UUID, NotificationDelivery> store = new HashMap<>();

        @Override
        public NotificationDelivery save(NotificationDelivery delivery) {
            store.put(delivery.id(), delivery);
            return delivery;
        }

        @Override
        public Optional<NotificationDelivery> findById(UUID id) {
            return Optional.ofNullable(store.get(id));
        }

        @Override
        public List<NotificationDelivery> findByNotificationId(UUID notificationId) {
            return store.values().stream().filter(d -> d.notificationId().equals(notificationId)).toList();
        }
    }
}
