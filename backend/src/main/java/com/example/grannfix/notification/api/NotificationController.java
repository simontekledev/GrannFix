package com.example.grannfix.notification.api;

import com.example.grannfix.notification.api.dto.RegisterDeviceRequest;
import com.example.grannfix.notification.application.DeviceTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final DeviceTokenService deviceTokenService;

    @PutMapping("/devices/{deviceId}")
    public ResponseEntity<Void> registerDevice(
            @PathVariable String deviceId,
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody RegisterDeviceRequest request
    ) {
        deviceTokenService.registerDevice(userId, deviceId, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/devices/{deviceId}")
    public ResponseEntity<Void> removeDevice(
            @PathVariable String deviceId,
            @AuthenticationPrincipal UUID userId
    ) {
        deviceTokenService.removeDevice(deviceId, userId);
        return ResponseEntity.noContent().build();
    }
}
