package com.example.grannfix.user.application.port.out;

import java.util.UUID;

public interface TaskAdminPort {
    void cancelOpenOrAssignedTasksCreatedBy(UUID userId);

}