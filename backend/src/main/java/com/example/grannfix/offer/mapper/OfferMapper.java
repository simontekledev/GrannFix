package com.example.grannfix.offer.mapper;

import com.example.grannfix.offer.api.dto.OfferResponse;
import com.example.grannfix.offer.domain.Offer;
import lombok.experimental.UtilityClass;

@UtilityClass
public class OfferMapper {
    public OfferResponse toResponse(Offer o) {
        if(o == null) return null;

        return new OfferResponse(
                o.getId(),
                o.getHelperId(),
                o.getProposedPrice(),
                o.getMessage(),
                o.getStatus(),
                o.getCreatedAt()
        );
    }
}
