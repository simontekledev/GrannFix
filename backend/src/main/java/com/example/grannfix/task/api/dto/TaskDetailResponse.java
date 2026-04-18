package com.example.grannfix.task.api.dto;

import com.example.grannfix.task.domain.TaskStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TaskDetailResponse(
        UUID id,
        String title,
        String description,
        String category,
        String urgency,
        String city,
        String area,
        String street,
        BigDecimal offeredPrice,
        TaskStatus status,
        boolean active,
        Instant createdAt,
        Instant updatedAt,
        Instant completedAt,

        UserSummary createdBy,
        UserSummary assignedTo,
        Integer offersCount,
        UUID chatId,
        Permissions permissions
) {
    public record UserSummary(UUID id, String name) {}

    public record Permissions(
            boolean canEdit,
            boolean canCancel,
            boolean canOffer,
            boolean canChat
    ) {}
}