package com.example.grannfix.offer.infrastructure;

import com.example.grannfix.offer.persistence.OfferRepository;
import com.example.grannfix.task.application.port.out.OfferTaskPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OfferTaskAdapter implements OfferTaskPort {

    private final OfferRepository offerRepository;
    @Override
    public void declinePendingOffers(UUID taskId) {
        offerRepository.declinePendingOffersByTaskId(taskId);
    }

}