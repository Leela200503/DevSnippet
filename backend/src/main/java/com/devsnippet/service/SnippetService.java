package com.devsnippet.service;

import com.devsnippet.exception.ResourceNotFoundException;
import com.devsnippet.model.dto.SnippetRequest;
import com.devsnippet.model.dto.SnippetResponse;
import com.devsnippet.model.entity.Snippet;
import com.devsnippet.model.entity.User;
import com.devsnippet.repository.SnippetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class SnippetService {

    @Autowired
    private SnippetRepository snippetRepository;

    @Autowired
    private AuthService authService;

    public SnippetResponse createSnippet(SnippetRequest snippetRequest, String userEmail) {
        User user = authService.getUserEntityByEmail(userEmail);

        Snippet snippet = Snippet.builder()
                .title(snippetRequest.getTitle())
                .code(snippetRequest.getCode())
                .language(snippetRequest.getLanguage())
                .tags(snippetRequest.getTags())
                .description(snippetRequest.getDescription())
                .visibility(mapVisibility(snippetRequest.getVisibility()))
                .user(user)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Snippet savedSnippet = snippetRepository.save(snippet);
        return convertToResponse(savedSnippet, userEmail);
    }

    public SnippetResponse getSnippetById(Long id, String userEmail) {
        Snippet snippet = snippetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Snippet not found with id: " + id));

        // Check if user owns the snippet or if it's public
        if (!snippet.getUser().getEmail().equals(userEmail) &&
                !snippet.getVisibility().equals(Snippet.Visibility.PUBLIC)) {
            throw new ResourceNotFoundException("Snippet not found");
        }

        return convertToResponse(snippet, userEmail);
    }

    public Page<SnippetResponse> getUserSnippets(String userEmail, Pageable pageable) {
        User user = authService.getUserEntityByEmail(userEmail);
        Page<Snippet> snippets = snippetRepository.findByUser(user, pageable);

        return snippets.map(s -> convertToResponse(s, userEmail));
    }

    public Page<SnippetResponse> getUserSnippets(Long userId, Pageable pageable) {
        User user = authService.getUserEntityById(userId);
        Page<Snippet> snippets = snippetRepository.findByUser(user, pageable);
        
        // For public viewing, we don't necessarily have a current user email, but we'll try to get it
        String currentEmail = null;
        try {
            Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) currentEmail = auth.getName();
        } catch (Exception e) {}
        
        final String email = currentEmail;
        return snippets.map(s -> convertToResponse(s, email));
    }

    public Page<SnippetResponse> searchUserSnippets(String userEmail, String title, String language, Pageable pageable) {
        User user = authService.getUserEntityByEmail(userEmail);

        if (title != null && !title.isEmpty() && language != null && !language.isEmpty()) {
            return snippetRepository.findByUserAndTitleContainingIgnoreCaseAndLanguage(user, title, language, pageable)
                    .map(s -> convertToResponse(s, userEmail));
        } else if (title != null && !title.isEmpty()) {
            return snippetRepository.findByUserAndTitleContainingIgnoreCase(user, title, pageable)
                    .map(s -> convertToResponse(s, userEmail));
        } else if (language != null && !language.isEmpty()) {
            return snippetRepository.findByUserAndLanguage(user, language, pageable)
                    .map(s -> convertToResponse(s, userEmail));
        } else {
            return getUserSnippets(userEmail, pageable);
        }
    }

    public Page<SnippetResponse> getPublicSnippets(String title, String language, String tag, Pageable pageable, String currentUserEmail) {
        if (title != null && !title.isEmpty()) {
            return snippetRepository.findPublicSnippetsByTitle(title, pageable)
                    .map(s -> convertToResponse(s, currentUserEmail));
        } else if (language != null && !language.isEmpty()) {
            return snippetRepository.findPublicSnippetsByLanguage(language, pageable)
                    .map(s -> convertToResponse(s, currentUserEmail));
        } else if (tag != null && !tag.isEmpty()) {
            return snippetRepository.findPublicSnippetsByTag(tag, pageable)
                    .map(s -> convertToResponse(s, currentUserEmail));
        } else {
            return snippetRepository.findPublicSnippets(pageable)
                    .map(s -> convertToResponse(s, currentUserEmail));
        }
    }

    public SnippetResponse updateSnippet(Long id, SnippetRequest snippetRequest, String userEmail) {
        Snippet snippet = snippetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Snippet not found with id: " + id));

        if (!snippet.getUser().getEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("You don't have permission to update this snippet");
        }

        snippet.setTitle(snippetRequest.getTitle());
        snippet.setCode(snippetRequest.getCode());
        snippet.setLanguage(snippetRequest.getLanguage());
        snippet.setTags(snippetRequest.getTags());
        snippet.setDescription(snippetRequest.getDescription());
        snippet.setVisibility(mapVisibility(snippetRequest.getVisibility()));
        snippet.setUpdatedAt(LocalDateTime.now());

        Snippet updatedSnippet = snippetRepository.save(snippet);
        return convertToResponse(updatedSnippet, userEmail);
    }

    public void deleteSnippet(Long id, String userEmail) {
        Snippet snippet = snippetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Snippet not found with id: " + id));

        if (!snippet.getUser().getEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("You don't have permission to delete this snippet");
        }

        snippetRepository.delete(snippet);
    }

    public java.util.List<SnippetResponse> getFavoriteSnippets(String userEmail) {
        java.util.List<Snippet> favorites = socialService.getUserFavoriteSnippets(userEmail);
        return favorites.stream()
                .map(s -> convertToResponse(s, userEmail))
                .collect(Collectors.toList());
    }

    @Autowired
    private SocialService socialService;

    public long getSnippetCountByUser(User user) {
        return snippetRepository.countByUser(user);
    }

    private SnippetResponse convertToResponse(Snippet snippet, String currentUserEmail) {
        return SnippetResponse.builder()
                .id(snippet.getId())
                .title(snippet.getTitle())
                .code(snippet.getCode())
                .language(snippet.getLanguage())
                .tags(snippet.getTags())
                .description(snippet.getDescription())
                .visibility(snippet.getVisibility().toString())
                .user(com.devsnippet.model.dto.UserDTO.builder()
                        .id(snippet.getUser().getId())
                        .email(snippet.getUser().getEmail())
                        .name(snippet.getUser().getName())
                        .build())
                .likeCount(socialService.getLikeCount(snippet))
                .commentCount(socialService.getCommentCount(snippet))
                .liked(socialService.isSnippetLikedByUser(snippet, currentUserEmail))
                .favorited(socialService.isSnippetFavoritedByUser(snippet, currentUserEmail))
                .createdAt(snippet.getCreatedAt())
                .updatedAt(snippet.getUpdatedAt())
                .build();
    }

    private Snippet.Visibility mapVisibility(String visibility) {
        if (visibility == null || visibility.isEmpty()) {
            return Snippet.Visibility.PRIVATE;
        }
        try {
            return Snippet.Visibility.valueOf(visibility.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Snippet.Visibility.PRIVATE;
        }
    }
}
