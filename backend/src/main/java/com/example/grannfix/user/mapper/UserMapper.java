package com.example.grannfix.user.mapper;

import com.example.grannfix.user.api.dto.AdminUserDto;
import com.example.grannfix.user.api.dto.MeUserDto;
import com.example.grannfix.user.api.dto.PublicUserDto;
import com.example.grannfix.user.domain.User;
import lombok.experimental.UtilityClass;

@UtilityClass
public class UserMapper {
    public MeUserDto toMeDto(User user) {
        if (user == null) return null;

        return new MeUserDto(
                user.getId(),
                user.getPhoneNumber(),
                user.getEmail(),
                user.getName(),
                user.getBio(),
                user.getCity(),
                user.getArea(),
                user.getStreet(),
                user.isVerified(),
                safeDouble(user.getRatingAverage()),
                safeInt(user.getRatingCount()),
                user.getCreatedAt()
        );
    }

    public PublicUserDto toPublicDto(User user) {
        if (user == null) return null;

        return new PublicUserDto(
                user.getId(),
                user.getName(),
                user.getBio(),
                user.getCity(),
                user.getArea(),
                safeDouble(user.getRatingAverage()),
                safeInt(user.getRatingCount()),
                user.isVerified()
        );
    }

    public AdminUserDto toAdminDto(User user) {
        if (user == null) return null;

        return new AdminUserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getCity(),
                user.getArea(),
                user.isActive(),
                user.isVerified(),
                user.getRole(),
                safeDouble(user.getRatingAverage()),
                safeInt(user.getRatingCount()),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private double safeDouble(Double value) {
        return value != null ? value : 0.0;
    }

    private int safeInt(Integer value) {
        return value != null ? value : 0;
    }
}