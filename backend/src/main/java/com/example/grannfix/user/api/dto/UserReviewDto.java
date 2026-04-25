package com.example.grannfix.user.api.dto;

import java.time.Instant;
import java.util.UUID;

public record UserReviewDto(
        UUID offerId,
        Integer rating,
        String comment,
        UUID reviewerId,
        String reviewerName,
        String reviewerImageUrl,
        UUID taskId,
        String taskTitle,
        Instant completedAt
) {}
