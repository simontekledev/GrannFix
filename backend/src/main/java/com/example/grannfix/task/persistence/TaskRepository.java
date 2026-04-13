package com.example.grannfix.task.persistence;

import com.example.grannfix.task.domain.Task;
import com.example.grannfix.task.domain.TaskCategory;
import com.example.grannfix.task.domain.TaskStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByCreatedByIdAndActiveTrue(UUID userId);
    Optional<Task> findByIdAndActiveTrue(UUID taskId);
    List<Task> findByCreatedByIdAndStatusIn(UUID userId, List<TaskStatus> statuses);
    Optional<TaskOfferProjection> findProjectedById(UUID id);
    @Query("""
    SELECT t FROM Task t
    WHERE t.active = true
      AND (:status IS NULL OR t.status = :status)
      AND (:city IS NULL OR t.city = :city)
      AND (:area IS NULL OR t.area = :area)
      AND (:category IS NULL OR t.category = :category)
    ORDER BY t.createdAt DESC, t.id DESC
""")
    List<Task> findActive(
            @Param("status") TaskStatus status,
            @Param("city") String city,
            @Param("area") String area,
            @Param("category") TaskCategory category,
            Pageable pageable
    );

    @Query("""
    SELECT t FROM Task t
    WHERE t.active = true
      AND (:status IS NULL OR t.status = :status)
      AND (:city IS NULL OR t.city = :city)
      AND (:area IS NULL OR t.area = :area)
      AND (:category IS NULL OR t.category = :category)
      AND (
            t.createdAt < :cursorCreatedAt
            OR (t.createdAt = :cursorCreatedAt AND t.id < :cursorId)
      )
    ORDER BY t.createdAt DESC, t.id DESC
""")
    List<Task> findActiveAfterCursor(
            @Param("status") TaskStatus status,
            @Param("city") String city,
            @Param("area") String area,
            @Param("category") TaskCategory category,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            Pageable pageable
    );
}