package com.example.grannfix.task.api.dto;

import com.example.grannfix.task.domain.TaskStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        String title,
        String description,
        String city,
        String area,
        String street,
        BigDecimal offeredPrice,
        TaskStatus status,
        UUID createdById,
        boolean active,
        Instant createdAt,
        Instant updatedAt,
        Instant completedAt,
        int pendingOffersCount
) {}

