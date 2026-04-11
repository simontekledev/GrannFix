package com.example.grannfix.user.api.dto;

import java.time.Instant;
import java.util.UUID;

public record MeUserDto(
        UUID id,
        String phoneNumber,
        String email,
        String name,
        String bio,
        String city,
        String area,
        String street,
        boolean verified,
        String role,
        Double ratingAverage,
        Integer ratingCount,
        Instant createdAt
) {}
