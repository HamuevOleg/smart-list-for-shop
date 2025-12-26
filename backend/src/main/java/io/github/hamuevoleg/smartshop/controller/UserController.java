package io.github.hamuevoleg.smartshop.controller;

import io.github.hamuevoleg.smartshop.domain.User;
import io.github.hamuevoleg.smartshop.repository.UserRepository;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

@Controller
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @MutationMapping
    public User updateUserProfile(@Argument String username, @Argument String avatar) {
        // 1. Получаем email текущего юзера из JWT токена
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Ищем юзера в базе
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Обновляем данные
        user.setUsername(username);
        user.setAvatar(avatar);

        return userRepository.save(user);
    }
}