package com.notifyflow.application.port.in;

public interface UpdateDeliveryReadStatusUseCase {
    void markRead(String deliveryId);
    void markUnread(String deliveryId);
}
