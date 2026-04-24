package com.example.grannfix.common.contracts;

import java.util.Set;
import java.util.UUID;

public interface BlockLookupPort {

    boolean isBlockedEitherWay(UUID userA, UUID userB);

    Set<UUID> getBlockedAndBlockerIds(UUID userId);
}
