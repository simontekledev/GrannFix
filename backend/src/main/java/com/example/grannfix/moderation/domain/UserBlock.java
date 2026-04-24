package com.example.grannfix.moderation.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_blocks",
        uniqueConstraints = @UniqueConstraint(name = "uk_block_pair", columnNames = {"blockerId", "blockedId"}),
        indexes = {
                @Index(name = "idx_block_blocker", columnList = "blockerId"),
                @Index(name = "idx_block_blocked", columnList = "blockedId")
        })
public class UserBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID blockerId;

    @Column(nullable = false)
    private UUID blockedId;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
