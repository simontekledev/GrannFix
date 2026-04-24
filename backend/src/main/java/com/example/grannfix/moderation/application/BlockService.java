package com.example.grannfix.moderation.application;

import com.example.grannfix.common.contracts.UserLookupPort;
import com.example.grannfix.common.errors.BadRequestException;
import com.example.grannfix.common.errors.ConflictException;
import com.example.grannfix.common.errors.NotFoundException;
import com.example.grannfix.moderation.api.dto.BlockedUserDto;
import com.example.grannfix.moderation.domain.UserBlock;
import com.example.grannfix.moderation.persistence.UserBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BlockService {

    private final UserBlockRepository blockRepository;
    private final UserLookupPort userLookupPort;

    @Transactional
    public void blockUser(UUID blockerId, UUID blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new BadRequestException("You cannot block yourself");
        }
        if (!userLookupPort.existsActive(blockedId)) {
            throw new NotFoundException("User not found");
        }
        if (blockRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            throw new ConflictException("User is already blocked");
        }
        blockRepository.save(UserBlock.builder()
                .blockerId(blockerId)
                .blockedId(blockedId)
                .build());
    }

    @Transactional
    public void unblockUser(UUID blockerId, UUID blockedId) {
        if (!blockRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            throw new NotFoundException("Block not found");
        }
        blockRepository.deleteByBlockerIdAndBlockedId(blockerId, blockedId);
    }

    @Transactional(readOnly = true)
    public List<BlockedUserDto> listBlocked(UUID blockerId) {
        return blockRepository.findAllByBlockerId(blockerId).stream()
                .map(b -> new BlockedUserDto(
                        b.getBlockedId(),
                        userLookupPort.displayName(b.getBlockedId()),
                        userLookupPort.profileImageUrl(b.getBlockedId()),
                        b.getCreatedAt()))
                .toList();
    }
}
