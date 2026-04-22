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
    @Query(value = """
    SELECT t.* FROM tasks t
    WHERE t.active = true
      AND (:status IS NULL OR t.status = CAST(:status AS VARCHAR))
      AND (:city IS NULL OR t.city = :city)
      AND (:area IS NULL OR t.area = :area)
      AND (:category IS NULL OR t.category = CAST(:category AS VARCHAR))
      AND (:search IS NULL OR to_tsvector('swedish', t.title || ' ' || t.description) @@ to_tsquery('swedish', regexp_replace(trim(:search), '\\s+', ':* & ', 'g') || ':*'))
      AND (:minPrice IS NULL OR t.offered_price >= CAST(CAST(:minPrice AS VARCHAR) AS NUMERIC))
      AND (:maxPrice IS NULL OR t.offered_price <= CAST(CAST(:maxPrice AS VARCHAR) AS NUMERIC))
      AND (CAST(:createdAfter AS TIMESTAMP) IS NULL OR t.created_at >= CAST(:createdAfter AS TIMESTAMP))
    ORDER BY t.created_at DESC, t.id DESC
""", nativeQuery = true)
    List<Task> findActive(
            @Param("status") String status,
            @Param("city") String city,
            @Param("area") String area,
            @Param("category") String category,
            @Param("search") String search,
            @Param("minPrice") Integer minPrice,
            @Param("maxPrice") Integer maxPrice,
            @Param("createdAfter") Instant createdAfter,
            Pageable pageable
    );

    @Query(value = """
    SELECT t.* FROM tasks t
    WHERE t.active = true
      AND (:status IS NULL OR t.status = CAST(:status AS VARCHAR))
      AND (:city IS NULL OR t.city = :city)
      AND (:area IS NULL OR t.area = :area)
      AND (:category IS NULL OR t.category = CAST(:category AS VARCHAR))
      AND (:search IS NULL OR to_tsvector('swedish', t.title || ' ' || t.description) @@ to_tsquery('swedish', regexp_replace(trim(:search), '\\s+', ':* & ', 'g') || ':*'))
      AND (:minPrice IS NULL OR t.offered_price >= CAST(CAST(:minPrice AS VARCHAR) AS NUMERIC))
      AND (:maxPrice IS NULL OR t.offered_price <= CAST(CAST(:maxPrice AS VARCHAR) AS NUMERIC))
      AND (CAST(:createdAfter AS TIMESTAMP) IS NULL OR t.created_at >= CAST(:createdAfter AS TIMESTAMP))
      AND (
            t.created_at < :cursorCreatedAt
            OR (t.created_at = :cursorCreatedAt AND t.id < CAST(:cursorId AS UUID))
      )
    ORDER BY t.created_at DESC, t.id DESC""", nativeQuery = true)
    List<Task> findActiveAfterCursor(
            @Param("status") String status,
            @Param("city") String city,
            @Param("area") String area,
            @Param("category") String category,
            @Param("search") String search,
            @Param("minPrice") Integer minPrice,
            @Param("maxPrice") Integer maxPrice,
            @Param("createdAfter") Instant createdAfter,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            Pageable pageable
    );
}