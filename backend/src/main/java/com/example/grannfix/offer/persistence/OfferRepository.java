package com.example.grannfix.offer.persistence;

import com.example.grannfix.offer.domain.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
public interface OfferRepository extends JpaRepository<Offer, UUID> {
    Optional<Offer> findByTaskIdAndHelperId(UUID taskId, UUID helperId);
    boolean existsByTaskIdAndHelperId(UUID taskId, UUID helperId);
    List<Offer> findByTaskIdOrderByCreatedAtDesc(UUID taskId);
}