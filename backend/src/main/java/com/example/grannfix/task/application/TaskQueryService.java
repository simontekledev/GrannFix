package com.example.grannfix.task.application;

import com.example.grannfix.task.api.dto.CursorPageResponse;
import com.example.grannfix.task.api.dto.TaskCursor;
import com.example.grannfix.task.api.dto.TaskResponse;
import com.example.grannfix.task.mapper.TaskMapper;
import com.example.grannfix.task.domain.Task;
import com.example.grannfix.task.domain.TaskCategory;
import com.example.grannfix.task.domain.TaskStatus;
import com.example.grannfix.task.persistence.TaskRepository;
import com.example.grannfix.task.application.pagination.CursorCodec;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskQueryService {

    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public CursorPageResponse<TaskResponse> listTasks(
            String cursor,
            int limit,
            TaskStatus status,
            String city,
            String area,
            String category,
            String search,
            Integer minPrice,
            Integer maxPrice,
            String period
    ) {
        int safeLimit = Math.min(Math.max(limit, 1), 50);

        String statusStr = status != null ? status.name() : null;
        String catStr = null;
        if (category != null && !category.isBlank()) {
            try {
                catStr = TaskCategory.valueOf(category.toUpperCase()).name();
            } catch (IllegalArgumentException ignored) {}
        }
        String searchStr = (search != null && !search.isBlank()) ? search.trim() : null;

        Instant createdAfter = null;
        if (period != null) {
            createdAfter = switch (period) {
                case "today" -> Instant.now().truncatedTo(ChronoUnit.DAYS);
                case "week" -> Instant.now().minus(7, ChronoUnit.DAYS);
                case "month" -> Instant.now().minus(30, ChronoUnit.DAYS);
                default -> null;
            };
        }

        TaskCursor decoded = null;
        if (cursor != null && !cursor.isBlank()) {
            decoded = CursorCodec.decode(cursor);
        }

        Pageable pageable = PageRequest.of(0, safeLimit + 1);
        List<Task> rows;
        if (decoded == null) {
            rows = taskRepository.findActive(statusStr, blankToNull(city), blankToNull(area), catStr, searchStr, minPrice, maxPrice, createdAfter, pageable);
        } else {
            rows = taskRepository.findActiveAfterCursor(
                    statusStr,
                    blankToNull(city),
                    blankToNull(area),
                    catStr,
                    searchStr,
                    minPrice,
                    maxPrice,
                    createdAfter,
                    decoded.createdAt(),
                    decoded.id(),
                    pageable
            );
        }

        boolean hasMore = rows.size() > safeLimit;
        List<Task> page = hasMore ? rows.subList(0, safeLimit) : rows;

        List<TaskResponse> items = page.stream()
                .map(TaskMapper::toResponse)
                .toList();

        String nextCursor = null;
        if (hasMore && !page.isEmpty()) {
            Task last = page.get(page.size() - 1);
            nextCursor = CursorCodec.encode(new TaskCursor(last.getCreatedAt(), last.getId()));
        }

        return new CursorPageResponse<>(items, nextCursor, hasMore);
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}