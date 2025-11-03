package io.github.hamuevoleg.smartshop.service;

import io.github.hamuevoleg.smartshop.dto.GoogleSearchResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ImageSearchService {

    private final WebClient webClient;

    @Value("${google.api.key}")
    private String apiKey;

    @Value("${google.cx}")
    private String cx;

    private static final String GOOGLE_SEARCH_URL = "https://www.googleapis.com/customsearch/v1";

    public ImageSearchService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(GOOGLE_SEARCH_URL).build();
    }

    public List<String> searchImages(String query) {
        // Выполняем асинхронный HTTP-запрос
        GoogleSearchResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("key", apiKey)
                        .queryParam("cx", cx)
                        .queryParam("q", query)
                        .queryParam("searchType", "image")
                        .queryParam("num", 5)
                        .build())
                .retrieve()
                .bodyToMono(GoogleSearchResponse.class)
                .block();

        if (response == null || response.getItems() == null) {
            return Collections.emptyList();
        }

        return response.getItems().stream()
                .map(item -> item.getLink())
                .collect(Collectors.toList());
    }
}