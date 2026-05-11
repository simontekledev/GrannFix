package com.example.grannfix.task.api.dto;

import java.math.BigDecimal;

/**
 * Lightweight payload returned to the task poster when they want to pay
 * the assigned helper via Swish. Phone number is intentionally not exposed
 * via UserSummary — this endpoint is the only place a helper's phone is
 * surfaced, and only to the poster of the task they accepted.
 */
public record TaskPaymentInfoResponse(
        String helperPhoneNumber,
        String helperName,
        BigDecimal amount,
        String taskReference
) {}
