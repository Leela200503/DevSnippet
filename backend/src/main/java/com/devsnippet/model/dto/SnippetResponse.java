package com.devsnippet.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SnippetResponse {

    private Long id;
    private String title;
    private String code;
    private String language;
    private String tags;
    private String description;
    private String visibility;
    private UserDTO user;
    private long likeCount;
    private long commentCount;
    private boolean liked;
    private boolean favorited;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
