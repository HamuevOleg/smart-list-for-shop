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

    // Список категорий (оставляем как было)
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
        GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream("credentials.json"))
                .createScoped(Arrays.asList("https://www.googleapis.com/auth/cloud-platform"));

        this.vertexAI = new VertexAI.Builder()
                .setProjectId(projectId)
                .setLocation(location)
                .setCredentials(credentials)
                .build();

        this.model = new GenerativeModel(modelName, vertexAI);
    }

    public String suggestCategory(String itemName) {
        // ... (твой старый код suggestCategory оставляем без изменений) ...
        try {
            String prompt = String.format(
                    "Analyze the shopping item '%s'. " +
                            "Classify it strictly into one of these categories: [%s]. " +
                            "Return ONLY the category name (one word). If unsure, return 'Other'.",
                    itemName, CATEGORIES_PROMPT
            );
            GenerateContentResponse response = model.generateContent(prompt);
            return cleanResponse(response);
        } catch (Exception e) {
            System.err.println("Vertex AI Error (Category): " + e.getMessage());
            return "Other";
        }
    }

    // === НОВЫЙ МЕТОД ДЛЯ ЦЕН ===
    public String suggestPrices(String itemName) {
        try {
            // Промпт специально заточен под Кишинев и конкретный формат ответа
            String prompt = String.format(
                    "Act as a shopping assistant in Chisinau, Moldova. " +
                            "Estimate the current price for 1 unit (kg/pack/liter) of '%s' in MDL (Moldovan Leu). " +
                            "Compare prices specifically for 'Metro' and 'Linella'. " +
                            "Strict output format required: Shop1:Metro - Price:X; Shop2:Linella - Price:Y; " +
                            "Where X and Y are just numbers (e.g. 25.50). " +
                            "If you don't know exact price, estimate average market price for Moldova. " +
                            "Do not write any extra text.",
                    itemName
            );

            GenerateContentResponse response = model.generateContent(prompt);
            String result = cleanResponse(response);
            System.out.println("AI Price Suggestion: " + result); // Лог для отладки
            return result;

        } catch (Exception e) {
            System.err.println("Vertex AI Error (Price): " + e.getMessage());
            return "";
        }
    }

    private String cleanResponse(GenerateContentResponse response) {
        String text = ResponseHandler.getText(response).trim();
        return text.replace("\n", "").replace("`", "").trim();
    }

    // Перегрузка для старого метода, если использовался внутри
    private String cleanResponse(String text) {
        String cleaned = text.replace("\n", "").replace(".", "").trim();
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