package com.example.grannfix.moderation.api.dto;

import java.time.Instant;
import java.util.UUID;

public record BlockedUserDto(
        UUID userId,
        String name,
        String profileImageUrl,
        Instant blockedAt
) {}
