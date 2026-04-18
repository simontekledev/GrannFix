package com.example.grannfix.offer.mapper;

import com.example.grannfix.offer.api.dto.OfferResponse;
import com.example.grannfix.offer.domain.Offer;
import lombok.experimental.UtilityClass;

@UtilityClass
public class OfferMapper {
    public OfferResponse toResponse(Offer o) {
        return toResponse(o, null, null);
    }

    public OfferResponse toResponse(Offer o, String helperName) {
        return toResponse(o, helperName, null);
    }

    public OfferResponse toResponse(Offer o, String helperName, String helperProfileImageUrl) {
        if(o == null) return null;

        return new OfferResponse(
                o.getId(),
                o.getHelperId(),
                helperName,
                helperProfileImageUrl,
                o.getProposedPrice(),
                o.getMessage(),
                o.getStatus(),
                o.getCreatedAt(),
                o.getCompletedAt(),
                o.getRating(),
                o.getRatingComment()
        );
    }
}
