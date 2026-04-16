package com.example.grannfix.user.api.dto;

import java.util.UUID;

public record PublicUserDto(
        UUID id,
        String name,
        String bio,
        String city,
        String area,
        double ratingAverage,
        int ratingCount,
        int completedOffersCount,
        boolean verified
) {}
