package io.github.hamuevoleg.smartshop.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;

@Data
public class ShoppingItem {
    @Id
    private String id;
    private String name;
    private Double quantity;
    private String unit;
    private String category;
    private String dueDate;
    private String comment;
    private Double priceStore1;
    private Double priceStore2;
    private Double userPrice;
    private boolean completed = false;
    private String imageUrl;

    private String addedBy;
    private String addedByAvatar;
    private String completedBy;
    private String completedByAvatar;
}