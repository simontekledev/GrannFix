package com.example.grannfix.offer.infrastructure;

import com.example.grannfix.offer.domain.OfferStatus;
import com.example.grannfix.offer.persistence.OfferRepository;
import com.example.grannfix.task.application.port.out.OfferTaskPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OfferTaskAdapter implements OfferTaskPort {

    private final OfferRepository offerRepository;
    @Override
    public void declinePendingOffers(UUID taskId) {
        offerRepository.declinePendingOffersByTaskId(taskId);
    }

    @Override
    public int countPendingOffers(UUID taskId) {
        return offerRepository.countByTaskIdAndStatus(taskId, OfferStatus.PENDING);
    }

    @Override
    public boolean hasOffer(UUID taskId, UUID userId) {
        return offerRepository.existsByTaskIdAndHelperId(taskId, userId);
    }

    @Override
    public Map<UUID, Integer> countPendingOffersForTasks(List<UUID> taskIds) {
        if (taskIds.isEmpty()) return Map.of();
        return offerRepository.countPendingByTaskIds(taskIds, OfferStatus.PENDING)
                .stream()
                .collect(Collectors.toMap(r -> (UUID) r[0], r -> ((Long) r[1]).intValue()));
    }
}