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
                // Мы разрешаем нашему фронтенду (с localhost:5173)
                // обращаться ко всем путям ("/**") на нашем бэкенде.
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173") // URL твоего Vue-приложения
                        .allowedMethods("GET", "POST", "OPTIONS", "PUT", "DELETE") // Разрешаем все методы
                        .allowedHeaders("*") // Разрешаем все заголовки
                        .allowCredentials(true);
            }
        };
    }
}