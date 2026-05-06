package com.example.grannfix.common.contracts;

/**
 * Lightweight projection of user fields commonly needed when enriching
 * domain DTOs (offer listings, chat summaries, review listings).
 * All fields are nullable so consumers can render partial info gracefully.
 */
public record UserLookupView(
        String name,
        String profileImageUrl,
        Double ratingAverage,
        Integer ratingCount
) {}
