package io.github.hamuevoleg.smartshop.domain;

import lombok.Data;

@Data
public class UpdateItemInput {
    private String name;
    private Double quantity;
    private String unit;
    private String category;
    private String dueDate;
    private String comment;
    private Double priceStore1;
    private Double priceStore2;
    private Double userPrice;
    private String imageUrl;
}