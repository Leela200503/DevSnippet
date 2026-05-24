package com.devsnippet.repository;

import com.devsnippet.model.entity.Snippet;
import com.devsnippet.model.entity.SnippetLike;
import com.devsnippet.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SnippetLikeRepository extends JpaRepository<SnippetLike, Long> {
    long countBySnippet(Snippet snippet);
    boolean existsByUserAndSnippet(User user, Snippet snippet);
    Optional<SnippetLike> findByUserAndSnippet(User user, Snippet snippet);
}
