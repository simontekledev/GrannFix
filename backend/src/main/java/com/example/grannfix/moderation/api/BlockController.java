package com.example.grannfix.moderation.api;

import com.example.grannfix.moderation.api.dto.BlockedUserDto;
import com.example.grannfix.moderation.application.BlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users/me/blocks")
@RequiredArgsConstructor
public class BlockController {

    private final BlockService blockService;

    @GetMapping
    public List<BlockedUserDto> listBlocked(@AuthenticationPrincipal UUID userId) {
        return blockService.listBlocked(userId);
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Void> blockUser(@AuthenticationPrincipal UUID blockerId,
                                          @PathVariable("userId") UUID blockedId) {
        blockService.blockUser(blockerId, blockedId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> unblockUser(@AuthenticationPrincipal UUID blockerId,
                                            @PathVariable("userId") UUID blockedId) {
        blockService.unblockUser(blockerId, blockedId);
        return ResponseEntity.noContent().build();
    }
}
