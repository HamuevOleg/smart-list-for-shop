package io.github.hamuevoleg.smartshop.controller;

import io.github.hamuevoleg.smartshop.domain.ActivityLog;
import io.github.hamuevoleg.smartshop.repository.ActivityLogRepository;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class ActivityController {

    private final ActivityLogRepository repository;

    public ActivityController(ActivityLogRepository repository) {
        this.repository = repository;
    }

    @QueryMapping
    public List<ActivityLog> recentActivity() {
        // Возвращаем последние записи. Ограничим на уровне Java Stream для простоты, если записей много.
        return repository.findAllByOrderByTimestampDesc().stream().limit(50).toList();
    }
}