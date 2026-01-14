package io.github.hamuevoleg.smartshop.controller;

import io.github.hamuevoleg.smartshop.domain.*;
import io.github.hamuevoleg.smartshop.repository.ShoppingListRepository;
import io.github.hamuevoleg.smartshop.repository.UserRepository;
import io.github.hamuevoleg.smartshop.service.ActivityService;
import io.github.hamuevoleg.smartshop.service.GeminiService;
import io.github.hamuevoleg.smartshop.service.ImageSearchService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Controller
public class ShoppingListController {

    private final ShoppingListRepository repository;
    private final UserRepository userRepository;
    private final ImageSearchService imageSearchService;
    private final GeminiService geminiService;
    private final ActivityService activityService; // <-- Добавили

    public ShoppingListController(ShoppingListRepository repository,
                                  UserRepository userRepository,
                                  ImageSearchService imageSearchService,
                                  GeminiService geminiService,
                                  ActivityService activityService) { // <-- В конструктор
        this.repository = repository;
        this.userRepository = userRepository;
        this.imageSearchService = imageSearchService;
        this.geminiService = geminiService;
        this.activityService = activityService;
    }

    @QueryMapping
    public List<ShoppingList> allLists() {
        return repository.findAll();
    }

    @QueryMapping
    public ShoppingList listById(@Argument String id, @Argument UserInput user) {
        ShoppingList list = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("List not found"));

        if (user != null && user.getUsername() != null) {
            long now = System.currentTimeMillis();
            if (list.getParticipants() != null) {
                // Логика "joined" (если юзера не было в списке недавно)
                boolean alreadyHere = list.getParticipants().stream()
                        .anyMatch(p -> p.getUsername().equals(user.getUsername()));

                // Простая эвристика: если список участников пуст или юзер новый, логируем вход
                // (Чтобы не спамить логами при каждом поллинге, можно усложнить, но пока так)
                if (!alreadyHere) {
                    activityService.log(user, "joined", list.getName(), "join");
                }

                list.getParticipants().removeIf(p -> p.getUsername().equals(user.getUsername()));
            }
            list.getParticipants().add(new ListParticipant(
                    user.getUsername(),
                    user.getAvatar(),
                    String.valueOf(now)
            ));
            long oneHourAgo = now - (60 * 60 * 1000);
            list.getParticipants().removeIf(p -> {
                try {
                    return Long.parseLong(p.getLastSeen()) < oneHourAgo;
                } catch (Exception e) {
                    return true;
                }
            });
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
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int currentLists = repository.countByOwner(email);
        String plan = user.getSubscription() != null ? user.getSubscription() : "FREE";

        int limit = 3;
        if ("PRO".equals(plan)) limit = 10;
        if ("FAMILY".equals(plan)) limit = 25;

        if (currentLists >= limit) {
            throw new RuntimeException("List limit reached for " + plan + " plan. Please upgrade.");
        }

        ShoppingList newList = new ShoppingList();
        newList.setName(name);
        newList.setOwner(email);

        // Лог создания списка (собираем UserInput вручную из User)
        UserInput ui = new UserInput();
        ui.setUsername(user.getUsername());
        activityService.log(ui, "created list", name, "add");

        return repository.save(newList);
    }

    @MutationMapping
    public Boolean deleteList(@Argument String id) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        return repository.findById(id).map(list -> {
            if (list.getOwner() == null || list.getOwner().equals(currentUserEmail)) {
                repository.delete(list);

                // Лог удаления. Сложно получить UserInput здесь без доп. запроса,
                // поэтому пока пропустим или можно найти юзера по email
                return true;
            }
            throw new RuntimeException("You are not the owner of this list");
        }).orElse(false);
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

        // === AI CATEGORY ===
        String category = itemInput.getCategory();
        if (category == null || category.trim().isEmpty()) {
            try {
                category = geminiService.suggestCategory(itemInput.getName());
            } catch (Exception e) {
                System.out.println("AI Category failed (ignoring): " + e.getMessage());
                category = "Other";
            }
        }
        newItem.setCategory(category);

        // === AI PRICES ===
        if (itemInput.getPriceStore1() == null && itemInput.getPriceStore2() == null) {
            try {
                String aiResponse = geminiService.suggestPrices(itemInput.getName());
                if (aiResponse != null && !aiResponse.isEmpty()) {
                    parseAndSetPrices(newItem, aiResponse);
                }
            } catch (Exception e) {
                System.out.println("AI Price failed (ignoring): " + e.getMessage());
            }
        } else {
            newItem.setPriceStore1(itemInput.getPriceStore1());
            newItem.setPriceStore2(itemInput.getPriceStore2());
        }

        // === IMAGE SEARCH ===
        try {
            String searchQuery;
            if (category != null && !category.equalsIgnoreCase("Other")) {
                searchQuery = String.format("%s %s white background", category, itemInput.getName());
            } else {
                searchQuery = String.format("%s grocery food item white background", itemInput.getName());
            }
            List<String> images = imageSearchService.searchImages(searchQuery);
            if (!images.isEmpty()) {
                newItem.setImageUrl(images.get(0));
            }
        } catch (Exception e) {
            System.err.println("Error searching image: " + e.getMessage());
        }

        newItem.setDueDate(itemInput.getDueDate());
        newItem.setComment(itemInput.getComment());
        newItem.setUserPrice(itemInput.getUserPrice());
        newItem.setCompleted(false);
        newItem.setCreatedAt(String.valueOf(System.currentTimeMillis()));

        if (user != null) {
            newItem.setAddedBy(user.getUsername());
            newItem.setAddedByAvatar(user.getAvatar());
        }

        list.getItems().add(0, newItem);
        repository.save(list);

        // --> ЛОГИРОВАНИЕ <--
        activityService.log(user, "added", newItem.getName(), "add");

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
        // Пытаемся найти имя перед удалением для лога
        String itemName = list.getItems().stream()
                .filter(i -> i.getId().equals(itemId)).findFirst()
                .map(ShoppingItem::getName).orElse("Item");

        boolean removed = list.getItems().removeIf(item -> item.getId().equals(itemId));
        if (removed) {
            repository.save(list);
            // Для removeItem у нас нет UserInput в аргументах в текущей схеме,
            // поэтому лог записать сложно, не меняя схему. Пропустим или добавим позже.
        }
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

        // --> ЛОГИРОВАНИЕ <--
        if (completed) {
            activityService.log(user, "bought", item.getName(), "complete");
        } else {
            activityService.log(user, "uncheck", item.getName(), "delete"); // или другой тип
        }

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