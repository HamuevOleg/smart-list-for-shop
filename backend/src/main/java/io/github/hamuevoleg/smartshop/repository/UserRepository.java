package io.github.hamuevoleg.smartshop.repository;

import io.github.hamuevoleg.smartshop.domain.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
}