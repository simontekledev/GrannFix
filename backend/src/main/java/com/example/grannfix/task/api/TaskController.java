package com.example.grannfix.task.api;

import com.example.grannfix.task.api.dto.CreateTaskRequest;
import com.example.grannfix.task.api.dto.TaskDetailResponse;
import com.example.grannfix.task.api.dto.TaskPaymentInfoResponse;
import com.example.grannfix.task.api.dto.TaskResponse;
import com.example.grannfix.task.api.dto.UpdateTaskRequest;
import com.example.grannfix.task.application.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody CreateTaskRequest req) {

        TaskResponse savedTask = taskService.addTask(userId, req);
        return ResponseEntity
                .created(URI.create("/tasks/" + savedTask.id()))
                .body(savedTask);
    }

    @GetMapping("/me")
    public List<TaskResponse> getMyTasks(@AuthenticationPrincipal UUID userId) {
        return taskService.getMyTasks(userId);
    }

    @GetMapping("/{id}")
    public TaskDetailResponse getTask(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id
    ) {
        return taskService.getTaskById(userId, id);
    }

    @GetMapping("/{id}/payment-info")
    public TaskPaymentInfoResponse getPaymentInfo(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id
    ) {
        return taskService.getPaymentInfo(userId, id);
    }

    @PatchMapping("/{id}")
    public TaskResponse updateMyTask(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @RequestBody @Valid UpdateTaskRequest req
    ) {
        return taskService.updateMyTask(
                userId, id, req);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelTask(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id
    ){
        taskService.cancelMyTask(userId, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id
    ) {
        taskService.deleteMyTask(userId, id);
        return ResponseEntity.noContent().build();
    }
}