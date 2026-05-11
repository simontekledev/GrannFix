package com.example.grannfix.task.application.port.out;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
public interface OfferTaskPort {
    void declinePendingOffers(UUID taskId);
    int countPendingOffers(UUID taskId);
    boolean hasOffer(UUID taskId, UUID userId);
    Map<UUID, Integer> countPendingOffersForTasks(List<UUID> taskIds);
    Optional<BigDecimal> getAcceptedOfferPrice(UUID taskId);
}