package com.example.grannfix.offer.application.port.out;

import java.util.UUID;

public interface UserRatingPort {
    void updateRating(UUID userId, int newRating);
}
