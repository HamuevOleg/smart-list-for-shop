package io.github.hamuevoleg.smartshop.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String id; // UUID
    private String sender;
    private String avatar;
    private String text;
    private String timestamp;
}