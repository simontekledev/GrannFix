package com.example.grannfix.task.infrastructure;

import com.example.grannfix.common.errors.NotFoundException;
import com.example.grannfix.offer.application.port.out.TaskAssignmentPort;
import com.example.grannfix.offer.application.port.out.TaskOfferView;
import com.example.grannfix.task.domain.Task;
import com.example.grannfix.task.domain.TaskStatus;
import com.example.grannfix.task.persistence.TaskRepository;
import com.example.grannfix.user.application.port.out.TaskAdminPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TaskAdminAdapter implements TaskAdminPort, TaskAssignmentPort {

    private final TaskRepository taskRepository;
    @Override
    @Transactional
    public void cancelOpenOrAssignedTasksCreatedBy(UUID userId) {
        List<Task> tasks = taskRepository.findByCreatedByIdAndStatusIn(
                userId, List.of(TaskStatus.OPEN, TaskStatus.ASSIGNED)
        );

        for (Task task : tasks) {
            task.setStatus(TaskStatus.CANCELLED);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TaskOfferView> findById(UUID taskId) {
        return taskRepository.findProjectedById(taskId)
                .map(p -> new TaskOfferView(
                        p.getId(),
                        p.getCreatedById(),
                        p.getAssignedToId(),
                        p.getStatus() == TaskStatus.OPEN
                ));
    }
    @Override
    @Transactional
    public void assignTask(UUID taskId, UUID helperId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found: " + taskId));

        task.setAssignedToId(helperId);
        task.setStatus(TaskStatus.ASSIGNED);
    }

    @Override
    @Transactional
    public void completeTask(UUID taskId, Instant now) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found: " + taskId));

        task.setCompletedAt(now);
        task.setStatus(TaskStatus.COMPLETED);
    }
}