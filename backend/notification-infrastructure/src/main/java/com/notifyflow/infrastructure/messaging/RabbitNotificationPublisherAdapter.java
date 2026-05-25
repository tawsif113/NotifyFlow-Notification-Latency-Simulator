package com.notifyflow.infrastructure.messaging;

import com.notifyflow.application.port.out.NotificationEventPublisherPort;
import com.notifyflow.domain.model.NotificationEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class RabbitNotificationPublisherAdapter implements NotificationEventPublisherPort {
    public static final String EXCHANGE = "notifyflow.notifications.exchange";
    public static final String ROUTING_KEY = "notifyflow.notifications.created";

    private final RabbitTemplate rabbitTemplate;

    public RabbitNotificationPublisherAdapter(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publish(NotificationEvent event) {
        rabbitTemplate.convertAndSend(EXCHANGE, ROUTING_KEY, event);
    }
}
