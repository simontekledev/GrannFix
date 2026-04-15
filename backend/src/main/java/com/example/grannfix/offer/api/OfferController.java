package com.example.grannfix.offer.api;

import com.example.grannfix.offer.api.dto.OfferResponse;
import com.example.grannfix.offer.api.dto.RateHelperRequest;
import com.example.grannfix.offer.application.OfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
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
    ){
        return offerService.acceptOffer(offerId, userId);
    }
    @PostMapping("/{offerId}/cancel")
    public OfferResponse cancelOffer(
            @PathVariable UUID offerId,
            @AuthenticationPrincipal UUID userId
    ){
        return offerService.cancelOffer(offerId, userId);
    }

    @PostMapping("/{offerId}/mark-done")
    public OfferResponse markDoneOffer(
            @PathVariable UUID offerId,
            @AuthenticationPrincipal UUID userId
    ){
        return offerService.markDoneOffer(offerId, userId);
    }

    @PostMapping("/{offerId}/confirm-done")
    public OfferResponse confirmDoneOffer(
            @PathVariable UUID offerId,
            @AuthenticationPrincipal UUID userId
    ){
        return offerService.confirmDoneOffer(offerId, userId);
    }

    @PostMapping("/{offerId}/rate")
    public OfferResponse rateHelper(
            @PathVariable UUID offerId,
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody RateHelperRequest request
    ) {
        return offerService.rateHelper(offerId, userId, request);
    }
}
