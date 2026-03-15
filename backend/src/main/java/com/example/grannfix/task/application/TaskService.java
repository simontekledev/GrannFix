package com.example.grannfix.task.application;

import com.example.grannfix.common.contracts.UserLookupPort;
import com.example.grannfix.common.errors.BadRequestException;
import com.example.grannfix.common.errors.ForbiddenException;
import com.example.grannfix.common.errors.NotFoundException;
import com.example.grannfix.task.api.dto.CreateTaskRequest;
import com.example.grannfix.task.api.dto.TaskDetailResponse;
import com.example.grannfix.task.api.dto.TaskResponse;
import com.example.grannfix.task.api.dto.UpdateTaskRequest;
import com.example.grannfix.task.domain.Task;
import com.example.grannfix.task.domain.TaskStatus;
import com.example.grannfix.task.mapper.TaskMapper;
import com.example.grannfix.task.persistence.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserLookupPort userLookupPort;

    @Transactional
    public TaskResponse addTask(UUID createdById, CreateTaskRequest req) {
        if (!userLookupPort.existsActive(createdById)) {
            throw new NotFoundException("User not found: " + createdById);
        }

        if (!userLookupPort.isVerified(createdById)) {
            throw new ForbiddenException("Phone number must be verified (OTP) before creating tasks.");
        }

        BigDecimal price = req.offeredPrice();
        if (price != null && price.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("offeredPrice cannot be negative");
        }

        Task task = Task.builder()
                .createdById(createdById)
                .title(req.title().trim())
                .description(req.description().trim())
                .city(req.city().trim())
                .area(req.area().trim())
                .street(req.street() != null ? req.street().trim() : null)
                .offeredPrice(price)
                .build();
        Task saved = taskRepository.save(task);
        return TaskMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getMyTasks(UUID userId) {
        if (!userLookupPort.existsActive(userId)) {
            throw new NotFoundException("User not found: " + userId);
        }
        return taskRepository.findByCreatedByIdAndActiveTrue(userId)
                .stream()
                .map(TaskMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskDetailResponse getTaskById(UUID userId, UUID taskId) {
        Task task = taskRepository.findByIdAndActiveTrue(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found"));

        boolean isOwner = task.getCreatedById().equals(userId);
        if (!isOwner && task.getStatus() != TaskStatus.OPEN) {
            throw new ForbiddenException("Forbidden");
        }
        String name = userLookupPort.displayName(task.getCreatedById());
        return TaskMapper.toDetailResponse(task, userId, name);
    }

    @Transactional
    public TaskResponse updateMyTask(UUID userId, UUID taskId, UpdateTaskRequest req) {
        Task task = getTaskOrThrow(taskId);

        if (!task.getCreatedById().equals(userId)) {
            throw new ForbiddenException("You can only update your own tasks.");
        }

        if (!task.isActive()) {
            throw new BadRequestException("Inactive tasks cannot be updated.");
        }

        if (task.getStatus() == TaskStatus.ASSIGNED || task.getStatus() == TaskStatus.COMPLETED) {
            throw new BadRequestException("Assigned or completed tasks cannot be updated.");
        }

        if (req.offeredPrice() != null) task.setOfferedPrice(req.offeredPrice());
        if (req.title() != null) {
            String v = req.title().trim();
            if (v.isEmpty()) throw new BadRequestException("title cannot be blank");
            task.setTitle(v);
        }
        if (req.description() != null) {
            String v = req.description().trim();
            if (v.isEmpty()) throw new BadRequestException("description cannot be blank");
            task.setDescription(v);
        }
        if (req.city() != null) {
            String v = req.city().trim();
            if (v.isEmpty()) throw new BadRequestException("city cannot be blank");
            task.setCity(v);
        }
        if (req.area() != null) {
            String v = req.area().trim();
            if (v.isEmpty()) throw new BadRequestException("area cannot be blank");
            task.setArea(v);
        }
        if (req.street() != null) {
            String v = req.street().trim();
            task.setStreet(v.isEmpty() ? null : v);
        }

        Task saved = taskRepository.save(task);
        return TaskMapper.toResponse(saved);
    }

    @Transactional
    public void cancelMyTask(UUID userId, UUID taskId) {
        Task task = getTaskOrThrow(taskId);

        if (!task.getCreatedById().equals(userId)) {
            throw new ForbiddenException("You can only cancel your own tasks.");
        }
        if (!task.isActive()) {
            throw new BadRequestException("Task is already inactive.");
        }
        if (task.getStatus() == TaskStatus.COMPLETED || task.getStatus() == TaskStatus.CANCELLED) {
            throw new BadRequestException("Task cannot be cancelled.");
        }
        task.setStatus(TaskStatus.CANCELLED);
    }

    @Transactional
    public void deleteMyTask(UUID userId, UUID taskId) {
        Task task = getTaskOrThrow(taskId);

        if (!task.getCreatedById().equals(userId)) {
            throw new ForbiddenException("You can only delete your own tasks.");
        }
        if (task.getStatus() == TaskStatus.ASSIGNED || task.getStatus() == TaskStatus.COMPLETED) {
            throw new BadRequestException("Assigned or completed tasks cannot be deleted.");
        }
        task.setActive(false);
    }

    private Task getTaskOrThrow(UUID taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found"));
    }
}