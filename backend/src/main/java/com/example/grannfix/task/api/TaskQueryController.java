package com.example.grannfix.task.api;

import com.example.grannfix.task.api.dto.CursorPageResponse;
import com.example.grannfix.task.api.dto.TaskResponse;
import com.example.grannfix.task.domain.TaskStatus;
import com.example.grannfix.task.application.TaskQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskQueryController {

    private final TaskQueryService taskQueryService;

    @GetMapping
    public CursorPageResponse<TaskResponse> listTasks(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) String period
    ) {
        return taskQueryService.listTasks(userId, cursor, limit, status, city, area, category, search, minPrice, maxPrice, period);
    }
}