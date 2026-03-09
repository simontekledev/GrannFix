package com.example.grannfix.offer.application;

import com.example.grannfix.common.errors.BadRequestException;
import com.example.grannfix.common.errors.ConflictException;
import com.example.grannfix.common.errors.ForbiddenException;
import com.example.grannfix.common.errors.NotFoundException;
import com.example.grannfix.offer.api.dto.CreateOfferRequest;
import com.example.grannfix.offer.api.dto.OfferResponse;
import com.example.grannfix.common.contracts.TaskOfferPort;
import com.example.grannfix.common.contracts.TaskOfferView;
import com.example.grannfix.offer.domain.Offer;
import com.example.grannfix.offer.mapper.OfferMapper;
import com.example.grannfix.offer.persistence.OfferRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;
    private final TaskOfferPort taskOfferPort;
    @Transactional
    public OfferResponse createOffer(UUID taskId, UUID helperId, CreateOfferRequest req) {
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

    @Transactional
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
}