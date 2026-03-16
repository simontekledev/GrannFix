package com.example.grannfix.task.persistence;

import com.example.grannfix.task.domain.TaskStatus;

import java.util.UUID;

public interface TaskOfferProjection {
    UUID getId();
    UUID getCreatedById();
    UUID getAssignedToId();

    TaskStatus getStatus();
}