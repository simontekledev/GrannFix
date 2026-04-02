package com.example.grannfix.chat.mapper;

import com.example.grannfix.chat.api.dto.ChatMessageResponse;
import com.example.grannfix.chat.api.dto.ChatResponse;
import com.example.grannfix.chat.domain.Chat;
import com.example.grannfix.chat.domain.ChatMessage;
import lombok.experimental.UtilityClass;

@UtilityClass
public class ChatMapper {

    public ChatResponse toResponse(Chat chat) {
        return new ChatResponse(
                chat.getId(),
                chat.getTaskId(),
                chat.getOwnerId(),
                chat.getHelperId(),
                chat.getCreatedAt()
        );
    }

    public ChatMessageResponse toMessageResponse(ChatMessage msg) {
        return new ChatMessageResponse(
                msg.getId(),
                msg.getChatId(),
                msg.getSenderId(),
                msg.getContent(),
                msg.getCreatedAt()
        );
    }
}
