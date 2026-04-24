package com.example.grannfix.moderation.api.dto;

import com.example.grannfix.moderation.domain.ReportReason;
import com.example.grannfix.moderation.domain.ReportStatus;

import java.time.Instant;
import java.util.UUID;

public record AdminReportDto(
        UUID id,
        UUID reporterId,
        String reporterName,
        UUID reportedUserId,
        String reportedUserName,
        ReportReason reason,
        String description,
        UUID contextTaskId,
        UUID contextChatId,
        ReportStatus status,
        String adminNotes,
        Instant createdAt,
        Instant updatedAt
) {}
