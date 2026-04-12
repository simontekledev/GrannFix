package com.example.grannfix.notification.api.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisterDeviceRequest(
        @NotBlank String fcmToken,
        @NotBlank String platform
) {}
