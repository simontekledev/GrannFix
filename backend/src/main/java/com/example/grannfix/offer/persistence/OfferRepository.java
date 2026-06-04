package com.example.grannfix.offer.persistence;

import com.example.grannfix.offer.domain.Offer;
import com.example.grannfix.offer.domain.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
public interface OfferRepository extends JpaRepository<Offer, UUID> {

    @Query("SELECT o FROM Offer o WHERE o.taskId = :taskId AND o.status IN :statuses")
    Optional<Offer> findByTaskIdAndStatusIn(
            @Param("taskId") UUID taskId,
            @Param("statuses") Collection<OfferStatus> statuses);


    Page<Offer> findByHelperIdAndStatusAndRatingIsNotNull(
            UUID helperId, OfferStatus status, Pageable pageable);

    boolean existsByTaskIdAndHelperId(UUID taskId, UUID helperId);
    Optional<Offer> findByTaskIdAndHelperId(UUID taskId, UUID helperId);
    List<Offer> findByTaskIdOrderByCreatedAtDesc(UUID taskId);
    boolean existsByTaskIdAndStatus(UUID taskId, OfferStatus offerStatus);
    int countByTaskIdAndStatus(UUID taskId, OfferStatus status);
    @Modifying
    @Query("""
        update Offer o
        set o.status = com.example.grannfix.offer.domain.OfferStatus.DECLINED
        where o.taskId = :taskId
          and o.id <> :acceptedOfferId
          and o.status = com.example.grannfix.offer.domain.OfferStatus.PENDING
    """)
    int rejectOtherPendingOffers(@Param("taskId") UUID taskId,
                                 @Param("acceptedOfferId") UUID acceptedOfferId);

    @Modifying
    @Query("""
    update Offer o
    set o.status = com.example.grannfix.offer.domain.OfferStatus.DECLINED
    where o.taskId = :taskId
      and o.status = com.example.grannfix.offer.domain.OfferStatus.PENDING
    """)
    int declinePendingOffersByTaskId(@Param("taskId") UUID taskId);

    @Query("SELECT o.taskId, COUNT(o) FROM Offer o WHERE o.taskId IN :taskIds AND o.status = :status GROUP BY o.taskId")
    List<Object[]> countPendingByTaskIds(@Param("taskIds") List<UUID> taskIds, @Param("status") OfferStatus status);

    List<Offer> findByHelperIdOrderByCreatedAtDesc(UUID helperId);
}