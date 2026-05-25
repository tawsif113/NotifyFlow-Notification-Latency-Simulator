package com.notifyflow.bootstrap.config;

import com.notifyflow.application.port.out.*;
import com.notifyflow.application.service.NotificationApplicationService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Configuration
public class ApplicationBeansConfig {
    @Bean(destroyMethod = "close")
    ExecutorService notificationFanOutExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }

    @Bean
    NotificationApplicationService notificationApplicationService(
            NotificationRepositoryPort notificationRepository,
            DeliveryRepositoryPort deliveryRepository,
            NotificationEventPublisherPort eventPublisher,
            RealtimePushPort realtimePushPort,
            ExecutorService notificationFanOutExecutor
    ) {
        return new NotificationApplicationService(notificationRepository, deliveryRepository, eventPublisher, realtimePushPort, notificationFanOutExecutor);
    }
}
