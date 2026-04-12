package com.example.grannfix.notification.persistence;

import com.example.grannfix.notification.domain.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, UUID> {

    Optional<DeviceToken> findByDeviceId(String deviceId);

    List<DeviceToken> findByUserId(UUID userId);

    void deleteByUserId(UUID userId);
}
