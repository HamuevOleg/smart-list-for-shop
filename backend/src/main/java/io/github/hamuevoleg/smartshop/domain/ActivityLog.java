package io.github.hamuevoleg.smartshop.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "activity_logs")
public class ActivityLog {
    @Id
    private String id;
    private String user;      // Имя юзера (Rune)
    private String action;    // Действие (added, completed)
    private String target;    // Цель (Milk)
    private String type;      // Тип для иконки (add, complete, delete, join)
    private String timestamp; // Время в миллисекундах (строкой)
}