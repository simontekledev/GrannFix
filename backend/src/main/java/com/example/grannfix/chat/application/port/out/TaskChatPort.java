package com.example.grannfix.chat.application.port.out;

import java.util.Optional;
import java.util.UUID;

public interface TaskChatPort {

    Optional<TaskChatView> findTaskForChat(UUID taskId);

    record TaskChatView(
            UUID id,
            UUID createdById,
            UUID assignedToId,
            String status
    ) {}
}
