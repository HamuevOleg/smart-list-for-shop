package io.github.hamuevoleg.smartshop.repository;

import io.github.hamuevoleg.smartshop.domain.ShoppingList;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface ShoppingListRepository extends MongoRepository<ShoppingList, String> {
    Optional<ShoppingList> findById(String id);

    // Подсчет списков по владельцу
    int countByOwner(String owner);
}