package io.github.hamuevoleg.smartshop.service;

import io.github.hamuevoleg.smartshop.domain.User;
import io.github.hamuevoleg.smartshop.dto.AuthPayload;
import io.github.hamuevoleg.smartshop.repository.UserRepository;
import io.github.hamuevoleg.smartshop.security.JwtUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, EmailService emailService, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.jwtUtils = jwtUtils;
    }

    // Шаг 1: Запросить код
    public boolean requestLogin(String email) {
        String code = String.format("%06d", new Random().nextInt(999999));

        User user = userRepository.findByEmail(email).orElse(new User());
        user.setEmail(email);
        user.setVerificationCode(code);
        user.setCodeExpiration(LocalDateTime.now().plusMinutes(5));

        // Если новый юзер, ставим дефолтное имя
        if (user.getUsername() == null) {
            user.setUsername(email.split("@")[0]);
            user.setAvatar("👤");
        }

        userRepository.save(user);

        // Отправка (если настроен SMTP) или вывод в консоль
         emailService.sendVerificationCode(email, code);
        System.out.println("LOGIN CODE FOR " + email + ": " + code); // Для тестов без SMTP

        return true;
    }

    // Шаг 2: Проверить код и выдать токен
    // Возвращаем AuthPayload, а не AuthResponse
    public AuthPayload verifyCode(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getVerificationCode() == null ||
                !user.getVerificationCode().equals(code) ||
                user.getCodeExpiration().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired code");
        }

        // Очищаем код после успеха
        user.setVerificationCode(null);
        userRepository.save(user);

        String token = jwtUtils.generateToken(email);

        return new AuthPayload(token, user); // <--- Используем AuthPayload
    }
}