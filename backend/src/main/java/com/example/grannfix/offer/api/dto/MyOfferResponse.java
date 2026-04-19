package com.example.grannfix.offer.api.dto;

import com.example.grannfix.offer.domain.OfferStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MyOfferResponse(
        UUID id,
        OfferStatus status,
        BigDecimal proposedPrice,
        Instant createdAt,
        TaskSummary task
) {
    public record TaskSummary(
            UUID id,
            String title,
            String category,
            String area,
            String status,
            String createdByName,
            String createdByProfileImageUrl
    ) {}
}
