package com.example.grannfix.user.application.port.out;

import com.example.grannfix.user.api.dto.UserReviewDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserReviewQueryPort {
    Page<UserReviewDto> findReviewsForHelper(UUID helperId, Pageable pageable);
}
