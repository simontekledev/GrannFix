package com.example.grannfix.moderation.api;

import com.example.grannfix.moderation.api.dto.CreateReportRequest;
import com.example.grannfix.moderation.api.dto.ReportResponse;
import com.example.grannfix.moderation.application.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReportResponse createReport(@AuthenticationPrincipal UUID userId,
                                       @Valid @RequestBody CreateReportRequest req) {
        return reportService.createReport(userId, req);
    }
}
