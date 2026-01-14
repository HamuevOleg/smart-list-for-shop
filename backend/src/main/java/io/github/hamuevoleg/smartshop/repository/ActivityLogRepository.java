package io.github.hamuevoleg.smartshop.repository;

import io.github.hamuevoleg.smartshop.domain.ActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    // Нам нужно получать последние 20 записей, отсортированных по времени (сначала новые)
    // В Spring Data naming convention это делается так, но для простоты мы отсортируем в контроллере или через Sort
    List<ActivityLog> findAllByOrderByTimestampDesc();
}