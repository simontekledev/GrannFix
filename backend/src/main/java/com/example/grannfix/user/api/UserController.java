package com.example.grannfix.user.api;

import com.example.grannfix.user.application.UserService;
import com.example.grannfix.user.api.dto.MeUserDto;
import com.example.grannfix.user.api.dto.PublicUserDto;
import com.example.grannfix.user.api.dto.ChangePasswordRequest;
import com.example.grannfix.user.api.dto.UpdateMeRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public MeUserDto getMe(@AuthenticationPrincipal UUID userId) {
        return userService.getMe(userId);
    }

    @PatchMapping("/me")
    public MeUserDto updateMe(@AuthenticationPrincipal UUID userId,
                              @Valid @RequestBody UpdateMeRequest req) {
        return userService.updateMe(userId, req);
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal UUID userId,
                                               @Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(userId, req);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> removeMe(@AuthenticationPrincipal UUID userId) {
        userService.removeMe(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public PublicUserDto getPublicUser(@PathVariable UUID id) {
        return userService.getPublicUser(id);
    }
}