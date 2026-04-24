package com.example.grannfix.moderation.infrastructure;

import com.example.grannfix.common.contracts.BlockLookupPort;
import com.example.grannfix.moderation.persistence.UserBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BlockLookupAdapter implements BlockLookupPort {

    private final UserBlockRepository blockRepository;

    @Override
    @Transactional(readOnly = true)
    public boolean isBlockedEitherWay(UUID userA, UUID userB) {
        if (userA == null || userB == null || userA.equals(userB)) return false;
        return blockRepository.existsBlockBetween(userA, userB);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<UUID> getBlockedAndBlockerIds(UUID userId) {
        Set<UUID> combined = new HashSet<>(blockRepository.findBlockedIdsByBlocker(userId));
        combined.addAll(blockRepository.findBlockerIdsByBlocked(userId));
        return combined;
    }
}
