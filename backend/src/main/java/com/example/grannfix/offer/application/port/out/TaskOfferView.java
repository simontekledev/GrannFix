package com.example.grannfix.offer.application.port.out;
import java.util.UUID;

public record TaskOfferView(UUID id, UUID createdById, UUID assignedToId, boolean offerable) {}