package com.example.grannfix.chat.persistence;

import com.example.grannfix.chat.domain.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findByChatIdAndCreatedAtAfterOrderByCreatedAtAsc(UUID chatId, Instant after);

    List<ChatMessage> findByChatIdOrderByCreatedAtAsc(UUID chatId);

    Optional<ChatMessage> findFirstByChatIdOrderByCreatedAtDesc(UUID chatId);

    @Query("""
        select m from ChatMessage m
        where m.chatId in :chatIds
          and m.createdAt = (
            select max(m2.createdAt) from ChatMessage m2 where m2.chatId = m.chatId
          )
    """)
    List<ChatMessage> findLastMessagesByChatIds(@Param("chatIds") Collection<UUID> chatIds);
}
