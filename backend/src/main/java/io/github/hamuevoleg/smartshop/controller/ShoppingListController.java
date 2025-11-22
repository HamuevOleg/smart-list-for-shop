package io.github.hamuevoleg.smartshop.controller;

import io.github.hamuevoleg.smartshop.domain.AddItemInput;
import io.github.hamuevoleg.smartshop.domain.ShoppingItem;
import io.github.hamuevoleg.smartshop.domain.ShoppingList;
import io.github.hamuevoleg.smartshop.domain.UpdateItemInput;
import io.github.hamuevoleg.smartshop.repository.ShoppingListRepository;
import io.github.hamuevoleg.smartshop.service.GeminiService; // <-- Импортируем наш новый сервис
import io.github.hamuevoleg.smartshop.service.ImageSearchService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Controller
public class ShoppingListController {

    private final ShoppingListRepository repository;
    private final ImageSearchService imageSearchService;
    private final GeminiService geminiService; // <-- Добавляем поле для AI сервиса

    // Обновляем конструктор, чтобы Spring мог внедрить GeminiService
    public ShoppingListController(ShoppingListRepository repository,
                                  ImageSearchService imageSearchService,
                                  GeminiService geminiService) {
        this.repository = repository;
        this.imageSearchService = imageSearchService;
        this.geminiService = geminiService;
    }

    @QueryMapping
    public List<ShoppingList> allLists() {
        return repository.findAll();
    }

    @QueryMapping
    public Optional<ShoppingList> listById(@Argument String id) {
        return repository.findById(id);
    }

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

        // === ИНТЕГРАЦИЯ С GEMINI (AI) ===
        String category = itemInput.getCategory();

        // Если категория не пришла с фронта (пустая или null), просим AI угадать её
        if (category == null || category.trim().isEmpty()) {
            // Передаем название товара, получаем категорию (например, "Dairy" для "Milk")
            category = geminiService.suggestCategory(itemInput.getName());
        }
        newItem.setCategory(category);
        // ================================

        newItem.setDueDate(itemInput.getDueDate());
        newItem.setComment(itemInput.getComment());
        newItem.setPriceStore1(itemInput.getPriceStore1());
        newItem.setPriceStore2(itemInput.getPriceStore2());
        newItem.setUserPrice(itemInput.getUserPrice());
        newItem.setCompleted(false);

        list.getItems().add(0, newItem);
        repository.save(list);
        return newItem;
    }

    @MutationMapping
    public ShoppingItem updateItem(@Argument String listId, @Argument String itemId, @Argument UpdateItemInput itemInput) {
        ShoppingList list = findListById(listId);
        ShoppingItem item = findItemById(list, itemId);

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
        if (removed) {
            repository.save(list);
        }
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
}