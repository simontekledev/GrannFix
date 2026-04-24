package com.example.grannfix.moderation.mapper;

import com.example.grannfix.common.contracts.UserLookupPort;
import com.example.grannfix.moderation.api.dto.AdminReportDto;
import com.example.grannfix.moderation.api.dto.ReportResponse;
import com.example.grannfix.moderation.domain.UserReport;
import lombok.experimental.UtilityClass;

@UtilityClass
public class ReportMapper {

    public ReportResponse toResponse(UserReport r) {
        return new ReportResponse(
                r.getId(),
                r.getReportedUserId(),
                r.getReason(),
                r.getDescription(),
                r.getStatus(),
                r.getCreatedAt()
        );
    }

    public AdminReportDto toAdminDto(UserReport r, UserLookupPort users) {
        return new AdminReportDto(
                r.getId(),
                r.getReporterId(),
                users.displayName(r.getReporterId()),
                r.getReportedUserId(),
                users.displayName(r.getReportedUserId()),
                r.getReason(),
                r.getDescription(),
                r.getContextTaskId(),
                r.getContextChatId(),
                r.getStatus(),
                r.getAdminNotes(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }
}
