package com.example.grannfix.offer.application.port.out;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface TaskAssignmentPort {
    Optional<TaskOfferView> findById(UUID taskId);
    void assignTask(UUID taskId, UUID helperId);
    void completeTask(UUID taskId, Instant now);

}