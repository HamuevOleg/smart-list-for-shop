package io.github.hamuevoleg.smartshop.service;

import io.github.hamuevoleg.smartshop.domain.ActivityLog;
import io.github.hamuevoleg.smartshop.domain.UserInput;
import io.github.hamuevoleg.smartshop.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ActivityService {

    private final ActivityLogRepository repository;

    public ActivityService(ActivityLogRepository repository) {
        this.repository = repository;
    }

    public void log(UserInput user, String action, String target, String type) {
        if (user == null || user.getUsername() == null) return;

        ActivityLog log = new ActivityLog(
                UUID.randomUUID().toString(),
                user.getUsername(),
                action,
                target,
                type,
                String.valueOf(System.currentTimeMillis())
        );
        repository.save(log);

        // Ограничиваем размер лога (например, храним только последние 100 записей), 
        // но для MVP пока просто сохраняем всё.
    }
}