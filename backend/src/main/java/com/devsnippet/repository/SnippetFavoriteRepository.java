package com.devsnippet.repository;

import com.devsnippet.model.entity.Snippet;
import com.devsnippet.model.entity.SnippetFavorite;
import com.devsnippet.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface SnippetFavoriteRepository extends JpaRepository<SnippetFavorite, Long> {
    Optional<SnippetFavorite> findByUserAndSnippet(User user, Snippet snippet);
    boolean existsByUserAndSnippet(User user, Snippet snippet);
    List<SnippetFavorite> findByUserOrderByCreatedAtDesc(User user);
}
