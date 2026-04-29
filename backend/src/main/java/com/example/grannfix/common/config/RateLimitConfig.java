package com.example.grannfix.common.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitConfig extends OncePerRequestFilter {

    private record RateConfig(int maxRequests, long windowMs) {}

    private static final Map<String, RateConfig> STRICT_PATHS = Map.of(
            "/auth/login",           new RateConfig(5, 60_000),
            "/auth/register",        new RateConfig(3, 60_000),
            "/auth/forgot-password", new RateConfig(3, 300_000),
            "/auth/refresh",         new RateConfig(10, 60_000)
    );

    private static final RateConfig DEFAULT_CONFIG = new RateConfig(60, 60_000);

    private record Window(AtomicInteger count, long expiresAt) {}
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String ip = getClientIp(request);
        String path = request.getRequestURI();
        String key = ip + ":" + path;

        RateConfig config = STRICT_PATHS.getOrDefault(path, DEFAULT_CONFIG);
        long now = System.currentTimeMillis();

        Window window = windows.compute(key, (k, existing) -> {
            if (existing == null || now > existing.expiresAt()) {
                return new Window(new AtomicInteger(1), now + config.windowMs());
            }
            existing.count().incrementAndGet();
            return existing;
        });

        if (window.count().get() > config.maxRequests()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Too many requests. Try again later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
