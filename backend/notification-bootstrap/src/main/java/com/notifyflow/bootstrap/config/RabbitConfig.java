package com.notifyflow.bootstrap.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    @Bean
    public TopicExchange notifyflowExchange() {
        return new TopicExchange(com.notifyflow.infrastructure.messaging.RabbitNotificationPublisherAdapter.EXCHANGE, true, false);
    }

    @Bean
    public Queue notifyflowQueue() {
        return QueueBuilder.durable(com.notifyflow.infrastructure.messaging.RabbitNotificationConsumerAdapter.QUEUE).build();
    }

    @Bean
    public Binding notifyflowBinding(Queue notifyflowQueue, TopicExchange notifyflowExchange) {
        return BindingBuilder.bind(notifyflowQueue)
                .to(notifyflowExchange)
                .with(com.notifyflow.infrastructure.messaging.RabbitNotificationPublisherAdapter.ROUTING_KEY);
    }

    @Bean
    public MessageConverter rabbitMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }
}
