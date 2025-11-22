package io.github.hamuevoleg.smartshop.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.cloud.vertexai.generativeai.ResponseHandler;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Arrays;

@Service
public class GeminiService {

    private final String projectId;
    private final String location;
    private final String modelName;

    private VertexAI vertexAI;
    private GenerativeModel model;

    // Список категорий, о которых знает фронтенд
    private static final String CATEGORIES_PROMPT =
            "Fruits, Vegetables, Dairy, Meat, Fish, Groceries, Beverages, Household, Other";

    public GeminiService(@Value("${google.cloud.project-id}") String projectId,
                         @Value("${google.cloud.location}") String location,
                         @Value("${google.cloud.ai.model}") String modelName) throws IOException {
        this.projectId = projectId;
        this.location = location;
        this.modelName = modelName;

        initModel();
    }

    private void initModel() throws IOException {
        // Загружаем файл ключей
        GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream("credentials.json"))
                // !!! ВАЖНО: Явно добавляем права доступа к Cloud Platform !!!
                .createScoped(Arrays.asList("https://www.googleapis.com/auth/cloud-platform"));

        // Инициализируем клиент Vertex AI
        this.vertexAI = new VertexAI.Builder()
                .setProjectId(projectId)
                .setLocation(location)
                .setCredentials(credentials)
                .build();

        // Создаем модель
        this.model = new GenerativeModel(modelName, vertexAI);
    }

    public String suggestCategory(String itemName) {
        try {
            String prompt = String.format(
                    "Analyze the shopping item '%s'. " +
                            "Classify it strictly into one of these categories: [%s]. " +
                            "Return ONLY the category name (one word). If unsure, return 'Other'.",
                    itemName, CATEGORIES_PROMPT
            );

            GenerateContentResponse response = model.generateContent(prompt);
            String result = ResponseHandler.getText(response).trim();

            return cleanResponse(result);
        } catch (Exception e) {
            System.err.println("Vertex AI Error: " + e.getMessage());
            // Если AI недоступен, возвращаем дефолт, чтобы приложение не падало
            return "Other";
        }
    }

    private String cleanResponse(String text) {
        // Убираем возможные лишние символы (точки, переносы строк)
        String cleaned = text.replace("\n", "").replace(".", "").trim();

        // Проверяем, валидная ли категория
        if (Arrays.stream(CATEGORIES_PROMPT.split(", ")).anyMatch(c -> c.equals(cleaned))) {
            return cleaned;
        }
        return "Other";
    }

    @PreDestroy
    public void close() {
        if (vertexAI != null) {
            vertexAI.close();
        }
    }
}