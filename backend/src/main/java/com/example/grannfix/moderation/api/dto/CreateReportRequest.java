package com.example.grannfix.moderation.api.dto;

import com.example.grannfix.moderation.domain.ReportReason;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateReportRequest(
        @NotNull UUID reportedUserId,
        @NotNull ReportReason reason,
        @Size(max = 2000) String description,
        UUID contextTaskId,
        UUID contextChatId
) {}
