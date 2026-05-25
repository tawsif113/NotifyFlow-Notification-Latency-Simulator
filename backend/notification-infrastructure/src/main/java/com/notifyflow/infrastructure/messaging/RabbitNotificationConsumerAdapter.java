package com.notifyflow.infrastructure.messaging;

import com.notifyflow.application.port.in.ConsumeNotificationEventUseCase;
import com.notifyflow.domain.model.NotificationEvent;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class RabbitNotificationConsumerAdapter {
    public static final String QUEUE = "notifyflow.notifications.queue";

    private final ConsumeNotificationEventUseCase consumeNotificationEventUseCase;

    public RabbitNotificationConsumerAdapter(ConsumeNotificationEventUseCase consumeNotificationEventUseCase) {
        this.consumeNotificationEventUseCase = consumeNotificationEventUseCase;
    }

    @RabbitListener(queues = QUEUE)
    public void consume(NotificationEvent event) {
        consumeNotificationEventUseCase.consume(event);
    }
}
