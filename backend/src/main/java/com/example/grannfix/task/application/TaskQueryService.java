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
            String category
    ) {
        int safeLimit = Math.min(Math.max(limit, 1), 50);

        TaskCategory cat = null;
        if (category != null && !category.isBlank()) {
            try {
                cat = TaskCategory.valueOf(category.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        TaskCursor decoded = null;
        if (cursor != null && !cursor.isBlank()) {
            decoded = CursorCodec.decode(cursor);
        }

        Pageable pageable = PageRequest.of(0, safeLimit + 1);
        List<Task> rows;
        if (decoded == null) {
            rows = taskRepository.findActive(status, blankToNull(city), blankToNull(area), cat, pageable);
        } else {
            rows = taskRepository.findActiveAfterCursor(
                    status,
                    blankToNull(city),
                    blankToNull(area),
                    cat,
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