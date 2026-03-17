package com.example.grannfix.offer.api;

import com.example.grannfix.offer.api.dto.CreateOfferRequest;
import com.example.grannfix.offer.api.dto.OfferResponse;
import com.example.grannfix.offer.application.OfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskOfferController {

    private final OfferService offerService;

    @PostMapping("/{taskId}/offers")
    public OfferResponse createOffer(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody CreateOfferRequest request
    ) {
        return offerService.createOffer(taskId, userId, request);
    }

    @GetMapping("/{taskId}/offers")
    public List<OfferResponse> getOffers(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal UUID userId
    ){
        return offerService.getTaskOffers(taskId, userId);
    }

}