package io.github.hamuevoleg.smartshop.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "shoppingLists")
public class ShoppingList {
    @Id
    private String id;
    private String name;
    private List<ShoppingItem> items = new ArrayList<>();
}