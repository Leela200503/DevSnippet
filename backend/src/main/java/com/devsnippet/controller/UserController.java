package com.devsnippet.controller;

import com.devsnippet.model.dto.UserProfileResponse;
import com.devsnippet.service.AuthService;
import com.devsnippet.service.SocialService;
import com.devsnippet.service.SnippetService;
import com.devsnippet.model.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class UserController {

    @Autowired
    private AuthService authService;

    @Autowired
    private SocialService socialService;

    @Autowired
    private SnippetService snippetService;

    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long id, Authentication authentication) {
        User user = authService.getUserEntityById(id);
        String currentUserEmail = (authentication != null) ? authentication.getName() : null;

        UserProfileResponse profile = UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .followersCount(socialService.getFollowersCount(user))
                .followingCount(socialService.getFollowingCount(user))
                .snippetsCount(snippetService.getSnippetCountByUser(user))
                .totalLikesReceived(socialService.getTotalLikesReceived(user))
                .isFollowing(currentUserEmail != null && socialService.isFollowing(currentUserEmail, id))
                .recentSnippets(snippetService.getFavoriteSnippets(user.getEmail())) // Reuse for now or fetch real snippets
                .build();

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<Void> updateProfile(@RequestBody Map<String, String> request, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        
        authService.updateProfile(authentication.getName(), request.get("name"), request.get("bio"));
        return ResponseEntity.ok().build();
    }
}
