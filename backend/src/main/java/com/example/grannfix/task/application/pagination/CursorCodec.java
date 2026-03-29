package com.example.grannfix.task.application.pagination;

import com.example.grannfix.task.api.dto.TaskCursor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class CursorCodec {

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    public static String encode(TaskCursor cursor) {
        try {
            String json = MAPPER.writeValueAsString(cursor);
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(json.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid cursor", e);
        }
    }

    public static TaskCursor decode(String encoded) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(encoded);
            String json = new String(decoded, StandardCharsets.UTF_8);
            return MAPPER.readValue(json, TaskCursor.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid cursor", e);
        }
    }
}