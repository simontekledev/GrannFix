package com.example.grannfix.moderation.api.dto;

import com.example.grannfix.moderation.domain.ReportReason;
import com.example.grannfix.moderation.domain.ReportStatus;

import java.time.Instant;
import java.util.UUID;

public record ReportResponse(
        UUID id,
        UUID reportedUserId,
        ReportReason reason,
        String description,
        ReportStatus status,
        Instant createdAt
) {}
