package com.example.grannfix.offer.application;

import com.example.grannfix.common.contracts.UserLookupPort;
import com.example.grannfix.common.errors.BadRequestException;
import com.example.grannfix.common.errors.ConflictException;
import com.example.grannfix.common.errors.ForbiddenException;
import com.example.grannfix.common.errors.NotFoundException;
import com.example.grannfix.offer.api.dto.CreateOfferRequest;
import com.example.grannfix.offer.api.dto.OfferResponse;
import com.example.grannfix.offer.api.dto.RateHelperRequest;
import com.example.grannfix.offer.application.port.out.TaskAssignmentPort;
import com.example.grannfix.offer.application.port.out.UserRatingPort;
import com.example.grannfix.offer.application.port.out.TaskOfferView;
import com.example.grannfix.offer.domain.Offer;
import com.example.grannfix.offer.domain.OfferStatus;
import com.example.grannfix.offer.mapper.OfferMapper;
import com.example.grannfix.offer.persistence.OfferRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;
    private final TaskAssignmentPort taskOfferPort;
    private final UserLookupPort userLookupPort;
    private final UserRatingPort userRatingPort;
    @Transactional
    public OfferResponse createOffer(UUID taskId, UUID helperId, CreateOfferRequest req) {
        if (!userLookupPort.isVerified(helperId)) {
            throw new ForbiddenException("Phone number must be verified (OTP) before creating offers.");
        }
        TaskOfferView task = taskOfferPort.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found: " + taskId));

        if (task.createdById().equals(helperId)) {
            throw new ForbiddenException("You cannot create an offer for your own task.");
        }
        if (!task.offerable()) {
            throw new BadRequestException("Task is not open for offers.");
        }
        if (offerRepository.existsByTaskIdAndHelperId(taskId, helperId)) {
            throw new ConflictException("You already have an offer for this task.");
        }
        Offer offer = Offer.builder()
                .taskId(taskId)
                .helperId(helperId)
                .proposedPrice(req.proposedPrice())
                .message(req.message())
                .build();
        try {
            Offer saved = offerRepository.save(offer);
            return OfferMapper.toResponse(saved);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("You already have an offer for this task.");
        }
    }

    @Transactional(readOnly = true)
    public List<OfferResponse> getTaskOffers(UUID taskId, UUID userId) {
        TaskOfferView task = taskOfferPort.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found: " + taskId));

        if (!task.createdById().equals(userId)) {
            throw new ForbiddenException("Not your task");
        }
        return offerRepository.findByTaskIdOrderByCreatedAtDesc(taskId)
                .stream()
                .map(OfferMapper::toResponse)
                .toList();
    }

    @Transactional
    public OfferResponse cancelOffer(UUID offerId, UUID userId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NotFoundException("Offer not found: " + offerId));

        if (!offer.getHelperId().equals(userId)) {
            throw new ForbiddenException("Not your offer");
        }

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new ConflictException("Only pending offers can be cancelled.");
        }
        offer.setStatus(OfferStatus.CANCELLED);
        Offer saved = offerRepository.save(offer);
        return OfferMapper.toResponse(saved);
    }

    @Transactional
    public OfferResponse acceptOffer(UUID offerId, UUID userId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NotFoundException("Offer not found: " + offerId));

        TaskOfferView task = taskOfferPort.findById(offer.getTaskId())
                .orElseThrow(() -> new NotFoundException("Task not found: " + offer.getTaskId()));

        if (!task.createdById().equals(userId)) {
            throw new ForbiddenException("Not your task");
        }
        if (!task.offerable()) {
            throw new BadRequestException("Task is not open for offers.");
        }
        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new ConflictException("Only pending offers can be accepted.");
        }
        if (offerRepository.existsByTaskIdAndStatus(offer.getTaskId(), OfferStatus.ACCEPTED)) {
            throw new ConflictException("Another offer has already been accepted for this task.");
        }
        try {
            offer.setStatus(OfferStatus.ACCEPTED);
            Offer saved = offerRepository.saveAndFlush(offer);
            offerRepository.rejectOtherPendingOffers(saved.getTaskId(), saved.getId());
            taskOfferPort.assignTask(saved.getTaskId(), saved.getHelperId());

            return OfferMapper.toResponse(saved);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Another offer has already been accepted for this task.");
        }
    }

    @Transactional
    public OfferResponse markDoneOffer(UUID offerId, UUID userId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NotFoundException("Offer not found: " + offerId));

        TaskOfferView task = taskOfferPort.findById(offer.getTaskId())
                .orElseThrow(() -> new NotFoundException("Task not found: " + offer.getTaskId()));

        if (!offer.getHelperId().equals(userId)) {
            throw new ForbiddenException("Not your offer");
        }
        if (offer.getStatus() != OfferStatus.ACCEPTED) {
            throw new BadRequestException("Only accepted offers can be marked as done.");
        }
        if (task.assignedToId() == null || !task.assignedToId().equals(userId)) {
            throw new ConflictException("Task is not assigned to this helper.");
        }
        offer.setStatus(OfferStatus.MARKED_DONE);
        Offer saved = offerRepository.save(offer);
        return OfferMapper.toResponse(saved);
    }

    @Transactional
    public OfferResponse confirmDoneOffer(UUID offerId, UUID userId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NotFoundException("Offer not found: " + offerId));

        TaskOfferView task = taskOfferPort.findById(offer.getTaskId())
                .orElseThrow(() -> new NotFoundException("Task not found: " + offer.getTaskId()));

        if (!task.createdById().equals(userId)) {
            throw new ForbiddenException("Not your task");
        }
        if (offer.getStatus() != OfferStatus.MARKED_DONE) {
            throw new BadRequestException("Only marked done offers can be confirmed.");
        }
        if (task.assignedToId() == null || !task.assignedToId().equals(offer.getHelperId())) {
            throw new ConflictException("Task is not assigned to this helper.");
        }
        Instant now = Instant.now();
        offer.setStatus(OfferStatus.COMPLETED);
        offer.setCompletedAt(now);
        Offer saved = offerRepository.save(offer);
        taskOfferPort.completeTask(saved.getTaskId(), now);
        return OfferMapper.toResponse(saved);
    }

    @Transactional
    public OfferResponse rateHelper(UUID offerId, UUID userId, RateHelperRequest req) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NotFoundException("Offer not found: " + offerId));

        TaskOfferView task = taskOfferPort.findById(offer.getTaskId())
                .orElseThrow(() -> new NotFoundException("Task not found: " + offer.getTaskId()));

        if (!task.createdById().equals(userId)) {
            throw new ForbiddenException("Only the task owner can rate the helper");
        }
        if (offer.getStatus() != OfferStatus.COMPLETED) {
            throw new BadRequestException("Can only rate completed offers");
        }
        if (offer.getRating() != null) {
            throw new ConflictException("Helper has already been rated for this offer");
        }

        offer.setRating(req.rating());
        offer.setRatingComment(req.comment() != null ? req.comment().trim() : null);
        Offer saved = offerRepository.save(offer);

        userRatingPort.updateRating(offer.getHelperId(), req.rating());

        return OfferMapper.toResponse(saved);
    }
}