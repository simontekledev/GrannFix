package com.example.grannfix.user.application;

import com.example.grannfix.common.errors.ConflictException;
import com.example.grannfix.common.errors.ForbiddenException;
import com.example.grannfix.common.errors.NotFoundException;
import com.example.grannfix.common.file.FileStorageService;
import com.example.grannfix.user.application.port.out.TaskAdminPort;
import com.example.grannfix.user.application.port.out.UserReviewQueryPort;
import com.example.grannfix.user.mapper.UserMapper;
import com.example.grannfix.user.persistence.UserRepository;
import com.example.grannfix.user.api.dto.MeUserDto;
import com.example.grannfix.user.api.dto.PublicUserDto;
import com.example.grannfix.user.api.dto.ChangePasswordRequest;
import com.example.grannfix.user.api.dto.UpdateMeRequest;
import com.example.grannfix.user.api.dto.UserReviewDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.example.grannfix.user.domain.User;
import com.example.grannfix.common.errors.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TaskAdminPort taskAdminPort;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final UserReviewQueryPort userReviewQueryPort;
    
    @Transactional(readOnly = true)
    public MeUserDto getMe(UUID userId) {
        return UserMapper.toMeDto(getActiveUserOrThrow(userId));
    }

    @Transactional
    public MeUserDto updateMe(UUID userId, UpdateMeRequest req) {
        User u = getActiveUserOrThrow(userId);
        if (req.name() != null) u.setName(req.name());
        if (req.bio() != null) u.setBio(req.bio());
        if (req.street() != null) u.setStreet(req.street());
        updateLocationIfChanged(u, req.city(), req.area());

        if (req.email() != null && !req.email().isBlank()) {
            String newEmail = req.email().trim().toLowerCase();

            if (u.getEmail() == null || !newEmail.equalsIgnoreCase(u.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new ConflictException("Email already in use") {
                    };
                }
                u.setEmail(newEmail);
            }
        }
        return UserMapper.toMeDto(u);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest req) {
        User u = getActiveUserOrThrow(userId);
        if (!passwordEncoder.matches(req.currentPassword(), u.getPassword())) {
            throw new UnauthorizedException("Wrong password");
        }
        u.setPassword(passwordEncoder.encode(req.newPassword()));
    }

    @Transactional
    public void removeMe(UUID userId){
        User u = getActiveUserOrThrow(userId);
        u.setActive(false);
        u.setEmail(null);
        u.setPhoneNumber(null);
        u.setName("Borttagen användare");
        u.setBio(null);
        u.setStreet(null);
        u.setPassword("DELETED");
        u.setVerified(false);
        taskAdminPort.cancelOpenOrAssignedTasksCreatedBy(u.getId());
    }

    @Transactional
    public MeUserDto updateProfileImage(UUID userId, MultipartFile file) {
        User u = getActiveUserOrThrow(userId);
        String oldImage = u.getProfileImageUrl();
        String url = fileStorageService.store(file);
        u.setProfileImageUrl(url);
        if (oldImage != null) {
            fileStorageService.delete(oldImage);
        }
        return UserMapper.toMeDto(u);
    }

    @Transactional
    public MeUserDto deleteProfileImage(UUID userId) {
        User u = getActiveUserOrThrow(userId);
        String oldImage = u.getProfileImageUrl();
        if (oldImage != null) {
            fileStorageService.delete(oldImage);
        }
        u.setProfileImageUrl(null);
        return UserMapper.toMeDto(u);
    }

    @Transactional(readOnly = true)
    public PublicUserDto getPublicUser(UUID userId) {
        return UserMapper.toPublicDto(getActiveUserOrThrow(userId));
    }

    @Transactional(readOnly = true)
    public Page<UserReviewDto> getReviews(UUID userId, Pageable pageable) {
        getActiveUserOrThrow(userId);
        return userReviewQueryPort.findReviewsForHelper(userId, pageable);
    }

    private User getActiveUserOrThrow(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new NotFoundException("User not found"));
        if (!user.isActive()) {
            throw new ForbiddenException("User is disabled");
        }
        return user;
    }

    private void updateLocationIfChanged(User user, String requestedCity, String requestedArea) {
        if (requestedCity == null || requestedCity.isBlank() ||
                requestedArea == null || requestedArea.isBlank()) {
            return;
        }
        String newCity = requestedCity.trim();
        String newArea = requestedArea.trim();

        boolean sameLocation =
                newCity.equalsIgnoreCase(user.getCity()) &&
                        newArea.equalsIgnoreCase(user.getArea());

        if (sameLocation) {
            return;
        }
        if (user.getAreaUpdatedAt() != null) {
            Instant nextAllowed = user.getAreaUpdatedAt()
                    .plus(Duration.ofDays(7));

            if (Instant.now().isBefore(nextAllowed)) {
                throw new ConflictException(
                        "LOCATION_CHANGE_COOLDOWN"
                );
            }
        }
        user.setCity(newCity);
        user.setArea(newArea);
        user.setAreaUpdatedAt(Instant.now());
    }

}
