package com.example.grannfix.chat.api;

import com.example.grannfix.chat.api.dto.ChatMessageResponse;
import com.example.grannfix.chat.api.dto.ChatResponse;
import com.example.grannfix.chat.api.dto.SendMessageRequest;
import com.example.grannfix.chat.application.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/tasks/{taskId}/chat")
    public ChatResponse getOrCreateChat(@PathVariable UUID taskId,
                                        @AuthenticationPrincipal UUID userId) {
        return chatService.getOrCreateChatForTask(taskId, userId);
    }

    @GetMapping("/chats/{chatId}/messages")
    public List<ChatMessageResponse> getMessages(@PathVariable UUID chatId,
                                                  @RequestParam(required = false) Instant after,
                                                  @AuthenticationPrincipal UUID userId) {
        return chatService.getMessages(chatId, after, userId);
    }

    @PostMapping("/chats/{chatId}/messages")
    public ChatMessageResponse sendMessage(@PathVariable UUID chatId,
                                           @Valid @RequestBody SendMessageRequest req,
                                           @AuthenticationPrincipal UUID userId) {
        return chatService.sendMessage(chatId, userId, req);
    }
}
