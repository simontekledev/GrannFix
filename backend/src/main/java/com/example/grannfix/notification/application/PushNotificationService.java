package com.example.grannfix.notification.application;

import com.example.grannfix.common.contracts.PushPort;
import com.example.grannfix.notification.domain.DeviceToken;
import com.example.grannfix.notification.persistence.DeviceTokenRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PushNotificationService implements PushPort {

    private final FirebaseMessaging firebaseMessaging;
    private final DeviceTokenRepository deviceTokenRepository;

    public void sendToUser(UUID userId, String title, String body) {
        List<DeviceToken> tokens = deviceTokenRepository.findByUserId(userId);
        for (DeviceToken token : tokens) {
            try {
                Message message = Message.builder()
                        .setToken(token.getFcmToken())
                        .setNotification(Notification.builder()
                                .setTitle(title)
                                .setBody(body)
                                .build())
                        .build();
                firebaseMessaging.send(message);
            } catch (Exception e) {
                log.warn("Failed to send push to device {}: {}", token.getDeviceId(), e.getMessage());
            }
        }
    }
}
