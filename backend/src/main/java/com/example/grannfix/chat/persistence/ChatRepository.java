package com.example.grannfix.chat.persistence;

import com.example.grannfix.chat.domain.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatRepository extends JpaRepository<Chat, UUID> {

    Optional<Chat> findByTaskId(UUID taskId);

    List<Chat> findByOwnerIdOrHelperIdOrderByCreatedAtDesc(UUID ownerId, UUID helperId);
}
