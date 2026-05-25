package com.notifyflow.application.service;

import com.notifyflow.application.port.in.*;
import com.notifyflow.application.port.out.*;
import com.notifyflow.domain.model.*;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

public class NotificationApplicationService implements SendNotificationUseCase, ConsumeNotificationEventUseCase, DeliveryQueryUseCase, UpdateDeliveryReadStatusUseCase {

    private final NotificationRepositoryPort notificationRepository;
    private final DeliveryRepositoryPort deliveryRepository;
    private final NotificationEventPublisherPort eventPublisher;
    private final RealtimePushPort realtimePushPort;
    private final Executor fanOutExecutor;

    public NotificationApplicationService(NotificationRepositoryPort notificationRepository,
                                          DeliveryRepositoryPort deliveryRepository,
                                          NotificationEventPublisherPort eventPublisher,
                                          RealtimePushPort realtimePushPort,
                                          Executor fanOutExecutor) {
        this.notificationRepository = notificationRepository;
        this.deliveryRepository = deliveryRepository;
        this.eventPublisher = eventPublisher;
        this.realtimePushPort = realtimePushPort;
        this.fanOutExecutor = fanOutExecutor;
    }

    @Override
    public NotificationResult send(Command command) {
        var now = Instant.now();
        var notification = new Notification(
                UUID.randomUUID(),
                command.tenantId(),
                command.eventType(),
                command.templateKey(),
                command.variables(),
                NotificationStatus.CREATED,
                now,
                now
        );
        var saved = notificationRepository.save(notification);
        var event = new NotificationEvent(saved.id(), saved.tenantId(), saved.eventType(), saved.templateKey(), saved.variables(), command.userIds(), Instant.now());
        eventPublisher.publish(event);
        notificationRepository.updateStatus(saved.id(), NotificationStatus.PUBLISHED);
        return new NotificationResult(saved.id(), NotificationStatus.PUBLISHED.name(), saved.createdAt().toString());
    }

    @Override
    public void consume(NotificationEvent event) {
        var title = String.valueOf(event.variables().getOrDefault("title", event.eventType()));
        var body = String.valueOf(event.variables().getOrDefault("body", ""));

        var deliveries = event.userIds().stream()
                .map(userId -> CompletableFuture.runAsync(
                        () -> deliverToUser(event, userId, title, body),
                        fanOutExecutor
                ))
                .toArray(CompletableFuture[]::new);

        CompletableFuture.allOf(deliveries).join();
        notificationRepository.updateStatus(event.notificationId(), NotificationStatus.DELIVERED);
    }

    private void deliverToUser(NotificationEvent event, String userId, String title, String body) {
        Instant created = Instant.now();
        Instant delivered = Instant.now();
        long latencyMs = Math.max(0, delivered.toEpochMilli() - event.publishedAt().toEpochMilli());
        var delivery = new NotificationDelivery(UUID.randomUUID(), event.notificationId(), event.tenantId(), userId, DeliveryStatus.DELIVERED, created, delivered, null, latencyMs);
        var saved = deliveryRepository.save(delivery);
        realtimePushPort.push(saved, title, body, event.notificationId().toString());
    }

    @Override
    public List<DeliveryView> listByNotification(String notificationId) {
        UUID id = UUID.fromString(notificationId);
        return deliveryRepository.findByNotificationId(id).stream().map(d -> new DeliveryView(
                d.id().toString(), d.notificationId().toString(), d.tenantId(), d.userId(), d.status().name(),
                d.createdAt() != null ? d.createdAt().toString() : null,
                d.deliveredAt() != null ? d.deliveredAt().toString() : null,
                d.readAt() != null ? d.readAt().toString() : null,
                d.latencyMs()
        )).toList();
    }

    @Override
    public void markRead(String deliveryId) {
        mutateReadStatus(deliveryId, true);
    }

    @Override
    public void markUnread(String deliveryId) {
        mutateReadStatus(deliveryId, false);
    }

    private void mutateReadStatus(String deliveryId, boolean read) {
        var id = UUID.fromString(deliveryId);
        var current = deliveryRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Delivery not found: " + deliveryId));
        var updated = new NotificationDelivery(
                current.id(), current.notificationId(), current.tenantId(), current.userId(),
                read ? DeliveryStatus.READ : DeliveryStatus.UNREAD,
                current.createdAt(), current.deliveredAt(), read ? Instant.now() : null, current.latencyMs()
        );
        deliveryRepository.save(updated);
    }
}
