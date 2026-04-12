package com.example.grannfix.notification.application;

import com.example.grannfix.notification.api.dto.RegisterDeviceRequest;
import com.example.grannfix.notification.domain.DeviceToken;
import com.example.grannfix.notification.domain.Platform;
import com.example.grannfix.notification.persistence.DeviceTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceTokenService {

    private final DeviceTokenRepository repository;

    @Transactional
    public void registerDevice(UUID userId, String deviceId, RegisterDeviceRequest req) {
        Platform platform;
        try {
            platform = Platform.valueOf(req.platform().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid platform: " + req.platform() + ". Must be IOS or ANDROID.");
        }

        DeviceToken token = repository.findByDeviceId(deviceId)
                .map(existing -> {
                    existing.setUserId(userId);
                    existing.setFcmToken(req.fcmToken());
                    existing.setPlatform(platform);
                    return existing;
                })
                .orElseGet(() -> DeviceToken.builder()
                        .userId(userId)
                        .deviceId(deviceId)
                        .fcmToken(req.fcmToken())
                        .platform(platform)
                        .build()
                );

        repository.save(token);
    }

    @Transactional
    public void removeDevice(String deviceId, UUID userId) {
        repository.findByDeviceId(deviceId)
                .filter(token -> token.getUserId().equals(userId))
                .ifPresent(repository::delete);
    }
}
