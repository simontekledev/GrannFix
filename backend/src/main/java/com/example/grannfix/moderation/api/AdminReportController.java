package com.example.grannfix.moderation.api;

import com.example.grannfix.moderation.api.dto.AdminReportDto;
import com.example.grannfix.moderation.api.dto.UpdateReportStatusRequest;
import com.example.grannfix.moderation.application.AdminReportService;
import com.example.grannfix.moderation.domain.ReportStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping
    public Page<AdminReportDto> listReports(@RequestParam(required = false) ReportStatus status,
                                            Pageable pageable) {
        return adminReportService.listReports(status, pageable);
    }

    @GetMapping("/{id}")
    public AdminReportDto getReport(@PathVariable UUID id) {
        return adminReportService.getReport(id);
    }

    @PatchMapping("/{id}")
    public AdminReportDto updateStatus(@PathVariable UUID id,
                                       @Valid @RequestBody UpdateReportStatusRequest req) {
        return adminReportService.updateStatus(id, req);
    }
}
