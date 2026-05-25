package com.notifyflow.application.port.out;

import com.notifyflow.domain.model.NotificationDelivery;

public interface RealtimePushPort {
    void push(NotificationDelivery delivery, String title, String body, String notificationId);
}
