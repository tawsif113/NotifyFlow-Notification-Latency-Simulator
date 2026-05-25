package com.notifyflow.application.port.out;

import com.notifyflow.domain.model.NotificationEvent;

public interface NotificationEventPublisherPort {
    void publish(NotificationEvent event);
}
