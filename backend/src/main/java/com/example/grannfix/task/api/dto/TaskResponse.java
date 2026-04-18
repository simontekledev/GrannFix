package com.example.grannfix.task.api.dto;

import com.example.grannfix.task.domain.TaskStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        String title,
        String description,
        String category,
        String urgency,
        String city,
        String area,
        String street,
        BigDecimal offeredPrice,
        List<String> imageUrls,
        TaskStatus status,
        UUID createdById,
        boolean active,
        Instant createdAt,
        Instant updatedAt,
        Instant completedAt,
        int pendingOffersCount
) {}

