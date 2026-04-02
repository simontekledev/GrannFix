package com.example.grannfix.chat.api.dto;

import java.time.Instant;
import java.util.UUID;

public record ChatResponse(
        UUID id,
        UUID taskId,
        UUID ownerId,
        UUID helperId,
        Instant createdAt
) {}
