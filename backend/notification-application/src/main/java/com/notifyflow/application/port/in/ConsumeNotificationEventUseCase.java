package com.notifyflow.application.port.in;

import com.notifyflow.domain.model.NotificationEvent;

public interface ConsumeNotificationEventUseCase {
    void consume(NotificationEvent event);
}
