package io.github.hamuevoleg.smartshop.controller;

import io.github.hamuevoleg.smartshop.dto.AuthPayload; // <--- Импорт
import io.github.hamuevoleg.smartshop.service.AuthService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @MutationMapping
    public Boolean requestLoginCode(@Argument String email) {
        return authService.requestLogin(email);
    }

    @MutationMapping
    public AuthPayload loginWithCode(@Argument String email, @Argument String code) {
        return authService.verifyCode(email, code);
    }
}