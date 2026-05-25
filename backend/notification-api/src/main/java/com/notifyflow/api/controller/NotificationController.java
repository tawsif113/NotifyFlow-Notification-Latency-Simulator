package com.notifyflow.api.controller;

import com.notifyflow.api.dto.CreateNotificationRequest;
import com.notifyflow.api.dto.NotificationResponse;
import com.notifyflow.application.port.in.DeliveryQueryUseCase;
import com.notifyflow.application.port.in.SendNotificationUseCase;
import com.notifyflow.application.port.in.UpdateDeliveryReadStatusUseCase;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class NotificationController {

    private final SendNotificationUseCase sendNotificationUseCase;
    private final DeliveryQueryUseCase deliveryQueryUseCase;
    private final UpdateDeliveryReadStatusUseCase updateDeliveryReadStatusUseCase;

    public NotificationController(SendNotificationUseCase sendNotificationUseCase,
                                  DeliveryQueryUseCase deliveryQueryUseCase,
                                  UpdateDeliveryReadStatusUseCase updateDeliveryReadStatusUseCase) {
        this.sendNotificationUseCase = sendNotificationUseCase;
        this.deliveryQueryUseCase = deliveryQueryUseCase;
        this.updateDeliveryReadStatusUseCase = updateDeliveryReadStatusUseCase;
    }

    @PostMapping("/notification-requests")
    public ResponseEntity<NotificationResponse> send(@Valid @RequestBody CreateNotificationRequest request) {
        var result = sendNotificationUseCase.send(new SendNotificationUseCase.Command(
                request.tenantId(), request.eventType(), request.templateKey(), request.variables(), request.userIds()
        ));
        return ResponseEntity.ok(new NotificationResponse(result.id().toString(), result.status(), result.createdAt()));
    }

    @GetMapping("/notification-requests/{notificationId}/deliveries")
    public ResponseEntity<?> listDeliveries(@PathVariable("notificationId") String notificationId) {
        return ResponseEntity.ok(deliveryQueryUseCase.listByNotification(notificationId));
    }

    @PatchMapping("/deliveries/{deliveryId}/read")
    public ResponseEntity<Map<String, String>> markRead(@PathVariable("deliveryId") String deliveryId) {
        updateDeliveryReadStatusUseCase.markRead(deliveryId);
        return ResponseEntity.ok(Map.of("status", "READ"));
    }

    @PatchMapping("/deliveries/{deliveryId}/unread")
    public ResponseEntity<Map<String, String>> markUnread(@PathVariable("deliveryId") String deliveryId) {
        updateDeliveryReadStatusUseCase.markUnread(deliveryId);
        return ResponseEntity.ok(Map.of("status", "UNREAD"));
    }
}
