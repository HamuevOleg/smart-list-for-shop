package io.github.hamuevoleg.smartshop.controller;

import io.github.hamuevoleg.smartshop.domain.*;
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

    @QueryMapping
    public List<ShoppingList> allLists() { return repository.findAll(); }

    @QueryMapping
    public ShoppingList listById(@Argument String id, @Argument UserInput user) {
        ShoppingList list = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("List not found"));

        if (user != null && user.getUsername() != null) {
            long now = System.currentTimeMillis();

            if (list.getParticipants() != null) {
                list.getParticipants().removeIf(p -> p.getUsername().equals(user.getUsername()));
            }

            list.getParticipants().add(new ListParticipant(
                    user.getUsername(),
                    user.getAvatar(),
                    String.valueOf(now)
            ));

            long oneHourAgo = now - (60 * 60 * 1000);
            list.getParticipants().removeIf(p -> Long.parseLong(p.getLastSeen()) < oneHourAgo);

            repository.save(list);
        }

        return list;
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
    public ShoppingItem addItem(@Argument String listId,
                                @Argument AddItemInput itemInput,
                                @Argument UserInput user) {
        ShoppingList list = findListById(listId);

        ShoppingItem newItem = new ShoppingItem();
        newItem.setId(UUID.randomUUID().toString());
        newItem.setName(itemInput.getName());
        newItem.setQuantity(itemInput.getQuantity());
        newItem.setUnit(itemInput.getUnit());

        String category = itemInput.getCategory();
        if (category == null || category.trim().isEmpty()) {
            category = geminiService.suggestCategory(itemInput.getName());
        }
        newItem.setCategory(category);

        if (itemInput.getPriceStore1() == null && itemInput.getPriceStore2() == null) {
            String aiResponse = geminiService.suggestPrices(itemInput.getName());
            if (!aiResponse.isEmpty()) {
                parseAndSetPrices(newItem, aiResponse);
            }
        } else {
            newItem.setPriceStore1(itemInput.getPriceStore1());
            newItem.setPriceStore2(itemInput.getPriceStore2());
        }

        newItem.setDueDate(itemInput.getDueDate());
        newItem.setComment(itemInput.getComment());
        newItem.setUserPrice(itemInput.getUserPrice());
        newItem.setCompleted(false);

        if (user != null) {
            newItem.setAddedBy(user.getUsername());
            newItem.setAddedByAvatar(user.getAvatar());
        }

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
        if (removed) repository.save(list);
        return removed;
    }

    @MutationMapping
    public ShoppingItem toggleItem(@Argument String listId,
                                   @Argument String itemId,
                                   @Argument Boolean completed,
                                   @Argument UserInput user) {
        ShoppingList list = findListById(listId);
        ShoppingItem item = findItemById(list, itemId);

        item.setCompleted(completed);

        if (completed && user != null) {
            item.setCompletedBy(user.getUsername());
            item.setCompletedByAvatar(user.getAvatar());
        } else {
            item.setCompletedBy(null);
            item.setCompletedByAvatar(null);
        }

        repository.save(list);
        return item;
    }

    @MutationMapping
    public ChatMessage sendMessage(@Argument String listId,
                                   @Argument String text,
                                   @Argument UserInput user) {
        ShoppingList list = findListById(listId);

        ChatMessage msg = new ChatMessage(
                UUID.randomUUID().toString(),
                user.getUsername(),
                user.getAvatar(),
                text,
                String.valueOf(System.currentTimeMillis())
        );

        list.getMessages().add(msg);

        if (list.getMessages().size() > 500) {
            list.getMessages().remove(0);
        }

        repository.save(list);
        return msg;
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

    private void parseAndSetPrices(ShoppingItem item, String aiResponse) {
        try {
            Double metroPrice = extractPrice(aiResponse, "Metro.*?Price:([\\d\\.]+)");
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