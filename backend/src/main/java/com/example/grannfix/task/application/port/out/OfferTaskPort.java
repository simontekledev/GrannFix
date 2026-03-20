package com.example.grannfix.task.application.port.out;
import java.util.UUID;
public interface OfferTaskPort {
    void declinePendingOffers(UUID taskId);
}