package com.notifyflow.bootstrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.notifyflow")
@EnableJpaRepositories(basePackages = "com.notifyflow.infrastructure.persistence.repo")
@EntityScan(basePackages = "com.notifyflow.infrastructure.persistence.entity")
public class NotifyflowApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotifyflowApplication.class, args);
    }
}
