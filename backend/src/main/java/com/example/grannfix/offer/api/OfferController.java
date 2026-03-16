package com.example.grannfix.offer.api;

import com.example.grannfix.offer.api.dto.OfferResponse;
import com.example.grannfix.offer.application.OfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;

    @PostMapping("/{offerId}/accept")
    public OfferResponse acceptOffer(
            @PathVariable UUID offerId,
            @AuthenticationPrincipal UUID userId
    ) {
        return offerService.acceptOffer(offerId, userId);
    }
    @PostMapping("/{offerId}/mark-done")
    public OfferResponse markDoneOffer(
            @PathVariable UUID offerId,
            @AuthenticationPrincipal UUID userId
    ) {
        return offerService.markDoneOffer(offerId, userId);
    }
}
