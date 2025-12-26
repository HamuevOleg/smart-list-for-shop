package io.github.hamuevoleg.smartshop.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;
    private String username;
    private String avatar;

    // Новое поле (по дефолту FREE)
    private String subscription = "FREE";

    private String verificationCode;
    private LocalDateTime codeExpiration;
}