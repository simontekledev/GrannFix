package com.example.grannfix.moderation.application;

import com.example.grannfix.common.contracts.UserLookupPort;
import com.example.grannfix.common.errors.BadRequestException;
import com.example.grannfix.common.errors.ConflictException;
import com.example.grannfix.common.errors.NotFoundException;
import com.example.grannfix.moderation.api.dto.CreateReportRequest;
import com.example.grannfix.moderation.api.dto.ReportResponse;
import com.example.grannfix.moderation.domain.UserReport;
import com.example.grannfix.moderation.mapper.ReportMapper;
import com.example.grannfix.moderation.persistence.UserReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final long DUPLICATE_WINDOW_DAYS = 7;

    private final UserReportRepository reportRepository;
    private final UserLookupPort userLookupPort;

    @Transactional
    public ReportResponse createReport(UUID reporterId, CreateReportRequest req) {
        if (reporterId.equals(req.reportedUserId())) {
            throw new BadRequestException("You cannot report yourself");
        }
        if (!userLookupPort.existsActive(req.reportedUserId())) {
            throw new NotFoundException("Reported user not found");
        }

        Instant windowStart = Instant.now().minus(DUPLICATE_WINDOW_DAYS, ChronoUnit.DAYS);
        if (reportRepository.existsByReporterIdAndReportedUserIdAndCreatedAtAfter(
                reporterId, req.reportedUserId(), windowStart)) {
            throw new ConflictException("You have already reported this user recently");
        }

        UserReport report = UserReport.builder()
                .reporterId(reporterId)
                .reportedUserId(req.reportedUserId())
                .reason(req.reason())
                .description(req.description())
                .contextTaskId(req.contextTaskId())
                .contextChatId(req.contextChatId())
                .build();

        return ReportMapper.toResponse(reportRepository.save(report));
    }
}
