package com.example.grannfix.offer.api.dto;

import com.example.grannfix.offer.domain.OfferStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OfferResponse(
        UUID id,
        UUID helperId,
        String helperName,
        String helperProfileImageUrl,
        Double helperRatingAverage,
        Integer helperRatingCount,
        BigDecimal proposedPrice,
        String message,
        OfferStatus status,
        Instant createdAt,
        Instant completedAt,
        Integer rating,
        String ratingComment
) {}
