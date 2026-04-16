package com.example.grannfix.common.contracts;

import java.util.UUID;

public interface PushPort {
    void sendToUser(UUID userId, String title, String body);
}
