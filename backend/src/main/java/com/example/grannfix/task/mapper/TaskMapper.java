package com.example.grannfix.task.mapper;

import com.example.grannfix.task.api.dto.TaskDetailResponse;
import com.example.grannfix.task.api.dto.TaskResponse;
import com.example.grannfix.task.domain.Task;
import com.example.grannfix.task.domain.TaskStatus;
import lombok.experimental.UtilityClass;

import java.util.UUID;

@UtilityClass
public class TaskMapper {

    public TaskResponse toResponse(Task t) {
        return new TaskResponse(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getCity(),
                t.getArea(),
                t.getStreet(),
                t.getOfferedPrice(),
                t.getStatus(),
                t.getCreatedById(),
                t.isActive(),
                t.getCreatedAt(),
                t.getUpdatedAt(),
                t.getCompletedAt()
        );
    }

    public TaskDetailResponse toDetailResponse(Task task, UUID viewerUserId, String ownerName, String helperName) {
        if (task == null) return null;

        UUID ownerId = task.getCreatedById();
        boolean isOwner = ownerId.equals(viewerUserId);

        boolean canEdit = isOwner && task.isActive() && task.getStatus() == TaskStatus.OPEN;
        boolean canCancel = isOwner && task.isActive()
                && (task.getStatus() == TaskStatus.OPEN || task.getStatus() == TaskStatus.ASSIGNED);
        boolean canOffer = viewerUserId != null && !isOwner && task.isActive() && task.getStatus() == TaskStatus.OPEN;
        boolean canChat = isOwner && task.isActive() && task.getStatus() == TaskStatus.ASSIGNED;

        var createdBy = new TaskDetailResponse.UserSummary(ownerId, ownerName);
        var assignedTo = task.getAssignedToId() != null
                ? new TaskDetailResponse.UserSummary(task.getAssignedToId(), helperName)
                : null;

        return new TaskDetailResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getCity(),
                task.getArea(),
                task.getStreet(),
                task.getOfferedPrice(),
                task.getStatus(),
                task.isActive(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                task.getCompletedAt(),
                createdBy,
                assignedTo,
                null,
                null,
                new TaskDetailResponse.Permissions(canEdit, canCancel, canOffer, canChat)
        );
    }
}