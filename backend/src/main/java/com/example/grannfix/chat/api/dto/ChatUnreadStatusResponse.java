package com.example.grannfix.chat.api.dto;

import java.time.Instant;
import java.util.UUID;

public record ChatUnreadStatusResponse(
        UUID chatId,
        Instant lastMessageAt,
        UUID lastMessageSenderId
) {}
