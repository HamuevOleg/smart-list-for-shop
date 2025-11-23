package io.github.hamuevoleg.smartshop.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListParticipant {
    private String username;
    private String avatar;
    private String lastSeen;
}