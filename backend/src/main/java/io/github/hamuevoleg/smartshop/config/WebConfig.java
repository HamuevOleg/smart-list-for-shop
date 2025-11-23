package io.github.hamuevoleg.smartshop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {

                registry.addMapping("/**")
                        // ВАЖНО: Разрешаем доступ со всех устройств в сети (для тестов)
                        // Можно заменить "*" на конкретный адрес: "http://192.168.0.91:5173"
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "OPTIONS", "PUT", "DELETE") // Разрешаем все методы
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}