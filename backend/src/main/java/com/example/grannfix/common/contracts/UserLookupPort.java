package com.example.grannfix.common.contracts;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;
public interface UserLookupPort {
    boolean existsActive(UUID userId);
    boolean isVerified(UUID userId);
    String displayName(UUID userId);
    String profileImageUrl(UUID userId);
    Map<UUID, String> displayNames(Collection<UUID> userIds);
    Map<UUID, String> profileImageUrls(Collection<UUID> userIds);
}