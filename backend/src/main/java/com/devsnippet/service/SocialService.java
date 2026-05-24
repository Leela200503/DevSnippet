package com.devsnippet.service;

import com.devsnippet.exception.ResourceNotFoundException;
import com.devsnippet.model.dto.CommentResponse;
import com.devsnippet.model.dto.UserDTO;
import com.devsnippet.model.entity.*;
import com.devsnippet.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SocialService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private SnippetLikeRepository snippetLikeRepository;

    @Autowired
    private SnippetFavoriteRepository snippetFavoriteRepository;

    @Autowired
    private UserFollowRepository userFollowRepository;

    @Autowired
    private SnippetRepository snippetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    // --- LIKES ---

    @Transactional
    public void likeSnippet(Long snippetId, String userEmail) {
        Snippet snippet = snippetRepository.findById(snippetId)
                .orElseThrow(() -> new ResourceNotFoundException("Snippet not found"));
        User user = authService.getUserEntityByEmail(userEmail);

        if (!snippetLikeRepository.existsByUserAndSnippet(user, snippet)) {
            SnippetLike like = SnippetLike.builder()
                    .user(user)
                    .snippet(snippet)
                    .build();
            snippetLikeRepository.save(like);
        }
    }

    @Transactional
    public void unlikeSnippet(Long snippetId, String userEmail) {
        Snippet snippet = snippetRepository.findById(snippetId)
                .orElseThrow(() -> new ResourceNotFoundException("Snippet not found"));
        User user = authService.getUserEntityByEmail(userEmail);

        snippetLikeRepository.findByUserAndSnippet(user, snippet)
                .ifPresent(snippetLikeRepository::delete);
    }

    // --- COMMENTS ---

    @Transactional
    public CommentResponse addComment(Long snippetId, String content, String userEmail) {
        Snippet snippet = snippetRepository.findById(snippetId)
                .orElseThrow(() -> new ResourceNotFoundException("Snippet not found"));
        User user = authService.getUserEntityByEmail(userEmail);

        Comment comment = Comment.builder()
                .content(content)
                .user(user)
                .snippet(snippet)
                .build();
        Comment savedComment = commentRepository.save(comment);
        return convertToCommentResponse(savedComment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getSnippetComments(Long snippetId) {
        Snippet snippet = snippetRepository.findById(snippetId)
                .orElseThrow(() -> new ResourceNotFoundException("Snippet not found"));
        return commentRepository.findBySnippetOrderByCreatedAtDesc(snippet).stream()
                .map(this::convertToCommentResponse)
                .collect(Collectors.toList());
    }

    // --- FAVORITES ---

    @Transactional
    public void favoriteSnippet(Long snippetId, String userEmail) {
        Snippet snippet = snippetRepository.findById(snippetId)
                .orElseThrow(() -> new ResourceNotFoundException("Snippet not found"));
        User user = authService.getUserEntityByEmail(userEmail);

        if (!snippetFavoriteRepository.existsByUserAndSnippet(user, snippet)) {
            SnippetFavorite favorite = SnippetFavorite.builder()
                    .user(user)
                    .snippet(snippet)
                    .build();
            snippetFavoriteRepository.save(favorite);
        }
    }

    @Transactional
    public void unfavoriteSnippet(Long snippetId, String userEmail) {
        Snippet snippet = snippetRepository.findById(snippetId)
                .orElseThrow(() -> new ResourceNotFoundException("Snippet not found"));
        User user = authService.getUserEntityByEmail(userEmail);

        snippetFavoriteRepository.findByUserAndSnippet(user, snippet)
                .ifPresent(snippetFavoriteRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<Snippet> getUserFavoriteSnippets(String userEmail) {
        User user = authService.getUserEntityByEmail(userEmail);
        return snippetFavoriteRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(SnippetFavorite::getSnippet)
                .collect(Collectors.toList());
    }

    // --- FOLLOW ---

    public void followUser(Long targetUserId, String followerEmail) {
        User following = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User to follow not found"));
        User follower = authService.getUserEntityByEmail(followerEmail);

        if (follower.getId().equals(following.getId())) {
            throw new RuntimeException("You cannot follow yourself");
        }

        if (!userFollowRepository.existsByFollowerAndFollowing(follower, following)) {
            UserFollow follow = UserFollow.builder()
                    .follower(follower)
                    .following(following)
                    .build();
            userFollowRepository.save(follow);
        }
    }

    public void unfollowUser(Long targetUserId, String followerEmail) {
        User following = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User to unfollow not found"));
        User follower = authService.getUserEntityByEmail(followerEmail);

        userFollowRepository.findByFollowerAndFollowing(follower, following)
                .ifPresent(userFollowRepository::delete);
    }
    public boolean isFollowing(String followerEmail, Long targetUserId) {
        User follower = authService.getUserEntityByEmail(followerEmail);
        User following = userRepository.findById(targetUserId).orElse(null);
        if (following == null) return false;
        return userFollowRepository.existsByFollowerAndFollowing(follower, following);
    }

    public long getFollowersCount(User user) {
        return userFollowRepository.countByFollowing(user);
    }

    public long getFollowingCount(User user) {
        return userFollowRepository.countByFollower(user);
    }

    public long getTotalLikesReceived(User user) {
        return snippetRepository.findByUser(user).stream()
                .mapToLong(snippetLikeRepository::countBySnippet)
                .sum();
    }

    // --- COUNTS ---

    public long getLikeCount(Snippet snippet) {
        return snippetLikeRepository.countBySnippet(snippet);
    }

    public long getCommentCount(Snippet snippet) {
        return commentRepository.countBySnippet(snippet);
    }

    public boolean isSnippetLikedByUser(Snippet snippet, String userEmail) {
        if (userEmail == null || userEmail.isEmpty()) {
            return false;
        }
        try {
            User user = authService.getUserEntityByEmail(userEmail);
            return snippetLikeRepository.existsByUserAndSnippet(user, snippet);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isSnippetFavoritedByUser(Snippet snippet, String userEmail) {
        if (userEmail == null || userEmail.isEmpty()) {
            return false;
        }
        try {
            User user = authService.getUserEntityByEmail(userEmail);
            return snippetFavoriteRepository.existsByUserAndSnippet(user, snippet);
        } catch (Exception e) {
            return false;
        }
    }

    private CommentResponse convertToCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .user(UserDTO.builder()
                        .id(comment.getUser().getId())
                        .email(comment.getUser().getEmail())
                        .name(comment.getUser().getName())
                        .build())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
