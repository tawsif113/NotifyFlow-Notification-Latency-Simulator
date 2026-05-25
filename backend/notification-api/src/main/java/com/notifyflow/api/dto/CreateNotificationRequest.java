package com.notifyflow.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.Map;

public record CreateNotificationRequest(
        @NotBlank String tenantId,
        @NotBlank String eventType,
        String templateKey,
        Map<String, Object> variables,
        @NotEmpty List<String> userIds
) {}
