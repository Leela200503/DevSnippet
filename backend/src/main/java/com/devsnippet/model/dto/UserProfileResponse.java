package com.devsnippet.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String bio;
    private long followersCount;
    private long followingCount;
    private long snippetsCount;
    private long totalLikesReceived;
    private boolean isFollowing;
    private List<SnippetResponse> recentSnippets;
}
