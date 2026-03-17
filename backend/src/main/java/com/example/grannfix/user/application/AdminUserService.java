package com.example.grannfix.user.application;

import com.example.grannfix.common.errors.BadRequestException;
import com.example.grannfix.common.errors.NotFoundException;
import com.example.grannfix.user.api.dto.AdminUserDto;
import com.example.grannfix.user.application.port.out.TaskManagementPort;
import com.example.grannfix.user.domain.User;
import com.example.grannfix.user.mapper.UserMapper;
import com.example.grannfix.user.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final TaskManagementPort taskAdminPort;

    @Transactional(readOnly = true)
    public Page<AdminUserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserMapper::toAdminDto);
    }

    @Transactional
    public void reactivateUser(UUID userId) {
        User u = getUserOrThrow(userId);
        if (u.isActive()) {
            throw new BadRequestException("User already active");
        }
        u.setActive(true);
    }

    @Transactional
    public void deactivateUser(UUID userId) {
        User u = getUserOrThrow(userId);

        if (!u.isActive()) {
            throw new BadRequestException("User already inactive");
        }
        u.setActive(false);
        taskAdminPort.cancelOpenOrAssignedTasksCreatedBy(u.getId());
    }

    private User getUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}