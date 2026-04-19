package com.example.grannfix.chat.api.dto;

import java.time.Instant;
import java.util.UUID;

public record ChatSummaryResponse(
        UUID id,
        UUID taskId,
        String taskTitle,
        UUID otherPartyId,
        String otherPartyName,
        String otherPartyProfileImageUrl,
        String lastMessage,
        Instant lastMessageAt
) {}
