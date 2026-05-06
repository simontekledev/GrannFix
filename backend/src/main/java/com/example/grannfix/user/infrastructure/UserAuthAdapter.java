package com.example.grannfix.user.infrastructure;

import com.example.grannfix.auth.application.ports.out.CreateUserCommand;
import com.example.grannfix.auth.application.ports.out.UserAuthPort;
import com.example.grannfix.auth.application.ports.out.UserAuthView;
import com.example.grannfix.common.contracts.UserLookupPort;
import com.example.grannfix.common.contracts.UserLookupView;
import com.example.grannfix.offer.application.port.out.UserRatingPort;
import com.example.grannfix.user.domain.User;
import com.example.grannfix.user.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserAuthAdapter implements UserAuthPort, UserLookupPort, UserRatingPort {

    private final UserRepository userRepository;

    @Override
    public Optional<UserAuthView> findByEmail(String email) {
        return userRepository.findByEmail(email).map(this::toView);
    }

    @Override
    public Optional<UserAuthView> findByPhone(String phone) {
        return userRepository.findByPhoneNumber(phone).map(this::toView);
    }

    @Override
    public Optional<UserAuthView> findById(UUID userId) {
        return userRepository.findById(userId).map(this::toView);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public UserAuthView createUser(CreateUserCommand cmd) {
        User user = User.builder()
                .email(cmd.email())
                .phoneNumber(cmd.phoneNumber())
                .password(cmd.encodedPassword())
                .name(cmd.name())
                .city(cmd.city())
                .area(cmd.area())
                .active(true)
                .verified(false)
                .build();
        userRepository.save(user);
        return toView(user);
    }

    @Override
    public void markVerified(UUID userId) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setVerified(true);
            userRepository.save(u);
        });
    }

    @Override
    public void updatePassword(UUID userId, String encodedPassword) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setPassword(encodedPassword);
            userRepository.save(u);
        });
    }

    @Override
    public boolean existsActive(UUID userId) {
        return userRepository.existsByIdAndActiveTrue(userId);
    }

    @Override
    public boolean isVerified(UUID userId) {
        return userRepository.findById(userId)
                .map(User::isVerified)
                .orElse(false);
    }

    @Override
    public String displayName(UUID userId) {
        return userRepository.findById(userId)
                .map(User::getName)
                .orElse(null);
    }

    @Override
    public String profileImageUrl(UUID userId) {
        return userRepository.findById(userId)
                .map(User::getProfileImageUrl)
                .orElse(null);
    }

    @Override
    public void updateRating(UUID userId, int newRating) {
        userRepository.findById(userId).ifPresent(user -> {
            int count = user.getRatingCount() != null ? user.getRatingCount() : 0;
            double avg = user.getRatingAverage() != null ? user.getRatingAverage() : 0.0;
            double newAvg = ((avg * count) + newRating) / (count + 1);
            user.setRatingAverage(Math.round(newAvg * 100.0) / 100.0);
            user.setRatingCount(count + 1);
        });
    }

    @Override
    public void incrementCompletedCount(UUID userId) {
        userRepository.findById(userId).ifPresent(user -> {
            int current = user.getCompletedOffersCount() != null ? user.getCompletedOffersCount() : 0;
            user.setCompletedOffersCount(current + 1);
        });
    }

    @Override
    public Map<UUID, UserLookupView> summaries(Collection<UUID> userIds) {
        if (userIds.isEmpty()) return Map.of();
        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(
                        User::getId,
                        u -> new UserLookupView(
                                u.getName(),
                                u.getProfileImageUrl(),
                                u.getRatingAverage(),
                                u.getRatingCount()
                        )
                ));
    }

    private UserAuthView toView(User u) {
        return new UserAuthView(
                u.getId(),
                u.getPhoneNumber(),
                u.getEmail(),
                u.getPassword(),
                u.getName(),
                u.getBio(),
                u.getCity(),
                u.getArea(),
                u.getStreet(),
                u.isActive(),
                u.isVerified()
        );
    }
}