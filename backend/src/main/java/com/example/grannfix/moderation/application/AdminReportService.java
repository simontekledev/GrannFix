package com.example.grannfix.moderation.application;

import com.example.grannfix.common.contracts.UserLookupPort;
import com.example.grannfix.common.errors.NotFoundException;
import com.example.grannfix.moderation.api.dto.AdminReportDto;
import com.example.grannfix.moderation.api.dto.UpdateReportStatusRequest;
import com.example.grannfix.moderation.domain.ReportStatus;
import com.example.grannfix.moderation.domain.UserReport;
import com.example.grannfix.moderation.mapper.ReportMapper;
import com.example.grannfix.moderation.persistence.UserReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminReportService {

    private final UserReportRepository reportRepository;
    private final UserLookupPort userLookupPort;

    @Transactional(readOnly = true)
    public Page<AdminReportDto> listReports(ReportStatus status, Pageable pageable) {
        Page<UserReport> page = (status != null)
                ? reportRepository.findAllByStatus(status, pageable)
                : reportRepository.findAll(pageable);
        return page.map(r -> ReportMapper.toAdminDto(r, userLookupPort));
    }

    @Transactional(readOnly = true)
    public AdminReportDto getReport(UUID id) {
        UserReport r = reportRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Report not found"));
        return ReportMapper.toAdminDto(r, userLookupPort);
    }

    @Transactional
    public AdminReportDto updateStatus(UUID id, UpdateReportStatusRequest req) {
        UserReport r = reportRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Report not found"));
        r.setStatus(req.status());
        if (req.adminNotes() != null) {
            r.setAdminNotes(req.adminNotes());
        }
        return ReportMapper.toAdminDto(r, userLookupPort);
    }
}
