package com.example.grannfix.offer.application.port.out;

import java.time.Instant;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface TaskAssignmentPort {
    Optional<TaskOfferView> findById(UUID taskId);
    void assignTask(UUID taskId, UUID helperId);
    void completeTask(UUID taskId, Instant now);
    Map<UUID, TaskOfferSummary> findTaskSummaries(Collection<UUID> taskIds);

    record TaskOfferSummary(UUID id, String title, String category, String area, String status, UUID createdById) {}
}