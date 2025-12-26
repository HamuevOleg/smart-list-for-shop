package io.github.hamuevoleg.smartshop.dto;

import io.github.hamuevoleg.smartshop.domain.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthPayload {
    private String token;
    private User user;
}