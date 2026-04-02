package com.example.grannfix.chat.api.dto;

import java.time.Instant;
import java.util.UUID;

public record ChatMessageResponse(
        UUID id,
        UUID chatId,
        UUID senderId,
        String content,
        Instant createdAt
) {}
