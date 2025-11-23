package io.github.hamuevoleg.smartshop.controller;

import io.github.hamuevoleg.smartshop.domain.AddItemInput;
import io.github.hamuevoleg.smartshop.domain.ShoppingItem;
import io.github.hamuevoleg.smartshop.domain.ShoppingList;
import io.github.hamuevoleg.smartshop.domain.UpdateItemInput;
import io.github.hamuevoleg.smartshop.repository.ShoppingListRepository;
import io.github.hamuevoleg.smartshop.service.GeminiService;
import io.github.hamuevoleg.smartshop.service.ImageSearchService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Controller
public class ShoppingListController {

    private final ShoppingListRepository repository;
    private final ImageSearchService imageSearchService;
    private final GeminiService geminiService;

    public ShoppingListController(ShoppingListRepository repository,
                                  ImageSearchService imageSearchService,
                                  GeminiService geminiService) {
        this.repository = repository;
        this.imageSearchService = imageSearchService;
        this.geminiService = geminiService;
    }

    // ... (QueryMappings остаются без изменений) ...
    @QueryMapping
    public List<ShoppingList> allLists() { return repository.findAll(); }

    @QueryMapping
    public Optional<ShoppingList> listById(@Argument String id) { return repository.findById(id); }

    @QueryMapping
    public List<String> searchImages(@Argument String query) {
        return imageSearchService.searchImages(query + " white background");
    }

    @MutationMapping
    public ShoppingList createList(@Argument String name) {
        ShoppingList newList = new ShoppingList();
        newList.setName(name);
        return repository.save(newList);
    }

    @MutationMapping
    public ShoppingItem addItem(@Argument String listId, @Argument AddItemInput itemInput) {
        ShoppingList list = findListById(listId);

        ShoppingItem newItem = new ShoppingItem();
        newItem.setId(UUID.randomUUID().toString());
        newItem.setName(itemInput.getName());
        newItem.setQuantity(itemInput.getQuantity());
        newItem.setUnit(itemInput.getUnit());

        // 1. AI Категория
        String category = itemInput.getCategory();
        if (category == null || category.trim().isEmpty()) {
            category = geminiService.suggestCategory(itemInput.getName());
        }
        newItem.setCategory(category);

        // 2. AI Цены (Парсинг)
        // Если пользователь не ввел цены сам, пробуем узнать у AI
        if (itemInput.getPriceStore1() == null && itemInput.getPriceStore2() == null) {
            String aiResponse = geminiService.suggestPrices(itemInput.getName());
            if (!aiResponse.isEmpty()) {
                parseAndSetPrices(newItem, aiResponse);
            }
        } else {
            // Если пользователь ввел, берем их
            newItem.setPriceStore1(itemInput.getPriceStore1());
            newItem.setPriceStore2(itemInput.getPriceStore2());
        }

        newItem.setDueDate(itemInput.getDueDate());
        newItem.setComment(itemInput.getComment());
        newItem.setUserPrice(itemInput.getUserPrice());
        newItem.setCompleted(false);

        list.getItems().add(0, newItem);
        repository.save(list);
        return newItem;
    }

    // ... (остальные методы updateItem, removeItem, toggleItem без изменений) ...
    @MutationMapping
    public ShoppingItem updateItem(@Argument String listId, @Argument String itemId, @Argument UpdateItemInput itemInput) {
        ShoppingList list = findListById(listId);
        ShoppingItem item = findItemById(list, itemId);
        // ... код обновления полей ...
        if (itemInput.getName() != null) item.setName(itemInput.getName());
        if (itemInput.getQuantity() != null) item.setQuantity(itemInput.getQuantity());
        if (itemInput.getUnit() != null) item.setUnit(itemInput.getUnit());
        if (itemInput.getCategory() != null) item.setCategory(itemInput.getCategory());
        if (itemInput.getDueDate() != null) item.setDueDate(itemInput.getDueDate());
        if (itemInput.getComment() != null) item.setComment(itemInput.getComment());
        if (itemInput.getPriceStore1() != null) item.setPriceStore1(itemInput.getPriceStore1());
        if (itemInput.getPriceStore2() != null) item.setPriceStore2(itemInput.getPriceStore2());
        if (itemInput.getUserPrice() != null) item.setUserPrice(itemInput.getUserPrice());
        if (itemInput.getImageUrl() != null) item.setImageUrl(itemInput.getImageUrl());

        repository.save(list);
        return item;
    }

    @MutationMapping
    public Boolean removeItem(@Argument String listId, @Argument String itemId) {
        ShoppingList list = findListById(listId);
        boolean removed = list.getItems().removeIf(item -> item.getId().equals(itemId));
        if (removed) repository.save(list);
        return removed;
    }

    @MutationMapping
    public ShoppingItem toggleItem(@Argument String listId, @Argument String itemId, @Argument Boolean completed) {
        ShoppingList list = findListById(listId);
        ShoppingItem item = findItemById(list, itemId);
        item.setCompleted(completed);
        repository.save(list);
        return item;
    }

    private ShoppingList findListById(String listId) {
        return repository.findById(listId)
                .orElseThrow(() -> new IllegalArgumentException("List not found: " + listId));
    }

    private ShoppingItem findItemById(ShoppingList list, String itemId) {
        return list.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));
    }

    // === Парсер строки от AI ===
    // Ожидаем формат: Shop1:Metro - Price:25.50; Shop2:Linella - Price:28.00;
    private void parseAndSetPrices(ShoppingItem item, String aiResponse) {
        try {
            // Простой парсинг с регулярными выражениями для надежности
            // Ищем число после "Metro - Price:"
            Double metroPrice = extractPrice(aiResponse, "Metro.*?Price:([\\d\\.]+)");
            // Ищем число после "Linella - Price:"
            Double linellaPrice = extractPrice(aiResponse, "Linella.*?Price:([\\d\\.]+)");

            if (metroPrice != null) item.setPriceStore1(metroPrice);
            if (linellaPrice != null) item.setPriceStore2(linellaPrice);

        } catch (Exception e) {
            System.err.println("Failed to parse AI prices: " + aiResponse);
        }
    }

    private Double extractPrice(String source, String regex) {
        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(source);
        if (matcher.find()) {
            try {
                return Double.parseDouble(matcher.group(1));
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}