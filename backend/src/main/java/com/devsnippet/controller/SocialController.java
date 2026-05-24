package com.devsnippet.controller;

import com.devsnippet.model.dto.CommentResponse;
import com.devsnippet.service.SocialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/social")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class SocialController {

    @Autowired
    private SocialService socialService;

    @PostMapping("/snippets/{id}/like")
    public ResponseEntity<Void> likeSnippet(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        socialService.likeSnippet(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/snippets/{id}/unlike")
    public ResponseEntity<Void> unlikeSnippet(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        socialService.unlikeSnippet(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/snippets/{id}/comment")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        CommentResponse comment = socialService.addComment(id, request.get("content"), authentication.getName());
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/snippets/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(socialService.getSnippetComments(id));
    }

    @PostMapping("/snippets/{id}/favorite")
    public ResponseEntity<Void> favoriteSnippet(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        socialService.favoriteSnippet(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/snippets/{id}/unfavorite")
    public ResponseEntity<Void> unfavoriteSnippet(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        socialService.unfavoriteSnippet(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{id}/follow")
    public ResponseEntity<Void> followUser(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        socialService.followUser(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{id}/unfollow")
    public ResponseEntity<Void> unfollowUser(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        socialService.unfollowUser(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
