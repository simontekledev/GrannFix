package com.example.grannfix.chat.application;

import com.example.grannfix.chat.api.dto.ChatMessageResponse;
import com.example.grannfix.chat.api.dto.ChatResponse;
import com.example.grannfix.chat.api.dto.ChatSummaryResponse;
import com.example.grannfix.chat.api.dto.SendMessageRequest;
import com.example.grannfix.chat.application.port.out.TaskChatPort;
import com.example.grannfix.chat.application.port.out.TaskChatPort.TaskChatView;
import com.example.grannfix.chat.domain.Chat;
import com.example.grannfix.chat.domain.ChatMessage;
import com.example.grannfix.chat.mapper.ChatMapper;
import com.example.grannfix.chat.persistence.ChatMessageRepository;
import com.example.grannfix.chat.persistence.ChatRepository;
import com.example.grannfix.common.contracts.UserLookupPort;
import com.example.grannfix.common.errors.ForbiddenException;
import com.example.grannfix.common.errors.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatMessageRepository messageRepository;
    private final TaskChatPort taskChatPort;
    private final UserLookupPort userLookupPort;

    @Transactional(readOnly = true)
    public List<ChatSummaryResponse> getMyChats(UUID userId) {
        var chats = chatRepository.findByOwnerIdOrHelperIdOrderByCreatedAtDesc(userId, userId);

        return chats.stream().map(chat -> {
            String taskTitle = taskChatPort.taskTitle(chat.getTaskId());
            UUID otherPartyId = chat.getOwnerId().equals(userId) ? chat.getHelperId() : chat.getOwnerId();
            String otherPartyName = userLookupPort.displayName(otherPartyId);
            var lastMsg = messageRepository.findFirstByChatIdOrderByCreatedAtDesc(chat.getId()).orElse(null);

            return new ChatSummaryResponse(
                    chat.getId(),
                    chat.getTaskId(),
                    taskTitle,
                    otherPartyName,
                    lastMsg != null ? lastMsg.getContent() : null,
                    lastMsg != null ? lastMsg.getCreatedAt() : chat.getCreatedAt()
            );
        }).toList();
    }

    @Transactional
    public ChatResponse getOrCreateChatForTask(UUID taskId, UUID userId) {
        TaskChatView task = taskChatPort.findTaskForChat(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found"));

        if (!"ASSIGNED".equals(task.status())) {
            throw new ForbiddenException("Chat is only available for assigned tasks");
        }

        boolean isOwner = task.createdById().equals(userId);
        boolean isHelper = task.assignedToId() != null && task.assignedToId().equals(userId);

        if (!isOwner && !isHelper) {
            throw new ForbiddenException("You are not part of this task");
        }

        Chat chat = chatRepository.findByTaskId(taskId)
                .orElseGet(() -> chatRepository.save(
                        Chat.builder()
                                .taskId(taskId)
                                .ownerId(task.createdById())
                                .helperId(task.assignedToId())
                                .build()
                ));

        return ChatMapper.toResponse(chat);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(UUID chatId, Instant after, UUID userId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new NotFoundException("Chat not found"));

        validateParticipant(chat, userId);

        List<ChatMessage> messages;
        if (after != null) {
            messages = messageRepository.findByChatIdAndCreatedAtAfterOrderByCreatedAtAsc(chatId, after);
        } else {
            messages = messageRepository.findByChatIdOrderByCreatedAtAsc(chatId);
        }

        return messages.stream().map(ChatMapper::toMessageResponse).toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(UUID chatId, UUID userId, SendMessageRequest req) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new NotFoundException("Chat not found"));

        validateParticipant(chat, userId);

        ChatMessage message = messageRepository.save(
                ChatMessage.builder()
                        .chatId(chatId)
                        .senderId(userId)
                        .content(req.content().trim())
                        .build()
        );

        return ChatMapper.toMessageResponse(message);
    }

    private void validateParticipant(Chat chat, UUID userId) {
        if (!chat.getOwnerId().equals(userId) && !chat.getHelperId().equals(userId)) {
            throw new ForbiddenException("You are not part of this chat");
        }
    }
}
