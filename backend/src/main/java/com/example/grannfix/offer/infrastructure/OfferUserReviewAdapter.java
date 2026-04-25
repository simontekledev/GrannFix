package com.example.grannfix.offer.infrastructure;

import com.example.grannfix.common.contracts.UserLookupPort;
import com.example.grannfix.offer.application.port.out.TaskAssignmentPort;
import com.example.grannfix.offer.domain.Offer;
import com.example.grannfix.offer.domain.OfferStatus;
import com.example.grannfix.offer.persistence.OfferRepository;
import com.example.grannfix.user.api.dto.UserReviewDto;
import com.example.grannfix.user.application.port.out.UserReviewQueryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OfferUserReviewAdapter implements UserReviewQueryPort {

    private final OfferRepository offerRepository;
    private final TaskAssignmentPort taskAssignmentPort;
    private final UserLookupPort userLookupPort;

    @Override
    @Transactional(readOnly = true)
    public Page<UserReviewDto> findReviewsForHelper(UUID helperId, Pageable pageable) {
        Page<Offer> offers = offerRepository.findByHelperIdAndStatusAndRatingIsNotNull(
                helperId, OfferStatus.COMPLETED, pageable);

        if (offers.isEmpty()) return offers.map(o -> null);

        Set<UUID> taskIds = offers.stream().map(Offer::getTaskId).collect(Collectors.toSet());
        Set<UUID> reviewerIds = new HashSet<>();
        Map<UUID, TaskAssignmentPort.TaskOfferSummary> tasks = taskAssignmentPort.findTaskSummaries(taskIds);
        for (var summary : tasks.values()) reviewerIds.add(summary.createdById());

        Map<UUID, String> names = userLookupPort.displayNames(reviewerIds);
        Map<UUID, String> images = userLookupPort.profileImageUrls(reviewerIds);

        return offers.map(o -> {
            var task = tasks.get(o.getTaskId());
            UUID reviewerId = task != null ? task.createdById() : null;
            return new UserReviewDto(
                    o.getId(),
                    o.getRating(),
                    o.getRatingComment(),
                    reviewerId,
                    reviewerId != null ? names.get(reviewerId) : null,
                    reviewerId != null ? images.get(reviewerId) : null,
                    o.getTaskId(),
                    task != null ? task.title() : null,
                    o.getCompletedAt()
            );
        });
    }
}
