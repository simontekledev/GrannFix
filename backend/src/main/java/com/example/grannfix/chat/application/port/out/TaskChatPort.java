package com.example.grannfix.chat.application.port.out;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface TaskChatPort {

    Optional<TaskChatView> findTaskForChat(UUID taskId);

    String taskTitle(UUID taskId);

    Map<UUID, String> taskTitles(Collection<UUID> taskIds);

    record TaskChatView(
            UUID id,
            UUID createdById,
            UUID assignedToId,
            String status
    ) {}
}
