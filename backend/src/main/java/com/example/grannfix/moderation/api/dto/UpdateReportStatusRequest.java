package com.example.grannfix.moderation.api.dto;

import com.example.grannfix.moderation.domain.ReportStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateReportStatusRequest(
        @NotNull ReportStatus status,
        @Size(max = 2000) String adminNotes
) {}
