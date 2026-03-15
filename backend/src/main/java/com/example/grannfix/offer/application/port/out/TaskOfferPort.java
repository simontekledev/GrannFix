package com.example.grannfix.offer.application.port.out;

import java.util.Optional;
import java.util.UUID;

public interface TaskOfferPort {
    Optional<TaskOfferView> findById(UUID taskId);
    void assignTask(UUID taskId, UUID helperId);

}