package com.example.grannfix.moderation.persistence;

import com.example.grannfix.moderation.domain.ReportStatus;
import com.example.grannfix.moderation.domain.UserReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface UserReportRepository extends JpaRepository<UserReport, UUID> {

    Page<UserReport> findAllByStatus(ReportStatus status, Pageable pageable);

    boolean existsByReporterIdAndReportedUserIdAndCreatedAtAfter(
            UUID reporterId, UUID reportedUserId, Instant after);

    long countByReportedUserIdAndStatus(UUID reportedUserId, ReportStatus status);
}
