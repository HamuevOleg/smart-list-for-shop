package io.github.hamuevoleg.smartshop.repository;

import io.github.hamuevoleg.smartshop.domain.ShoppingList;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ShoppingListRepository extends MongoRepository<ShoppingList, String> {

    Optional<ShoppingList> findById(String id);
}