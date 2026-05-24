package com.devsnippet.repository;

import com.devsnippet.model.entity.Snippet;
import com.devsnippet.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SnippetRepository extends JpaRepository<Snippet, Long> {

    // Get all snippets for a specific user
    Page<Snippet> findByUser(User user, Pageable pageable);
    java.util.List<Snippet> findByUser(User user);
    long countByUser(User user);

    // Search snippets by title for a user
    Page<Snippet> findByUserAndTitleContainingIgnoreCase(User user, String title, Pageable pageable);

    // Filter snippets by language for a user
    Page<Snippet> findByUserAndLanguage(User user, String language, Pageable pageable);

    // Search by title and language for a user
    Page<Snippet> findByUserAndTitleContainingIgnoreCaseAndLanguage(
            User user, String title, String language, Pageable pageable);

    // Get public snippets
    @Query("SELECT s FROM Snippet s WHERE s.visibility = 'PUBLIC'")
    Page<Snippet> findPublicSnippets(Pageable pageable);

    // Search public snippets by title
    @Query("SELECT s FROM Snippet s WHERE s.visibility = 'PUBLIC' " +
           "AND LOWER(s.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<Snippet> findPublicSnippetsByTitle(@Param("title") String title, Pageable pageable);

    // Get public snippets by language
    @Query("SELECT s FROM Snippet s WHERE s.visibility = 'PUBLIC' AND s.language = :language")
    Page<Snippet> findPublicSnippetsByLanguage(@Param("language") String language, Pageable pageable);

    // Search public snippets by tags
    @Query("SELECT s FROM Snippet s WHERE s.visibility = 'PUBLIC' " +
           "AND LOWER(s.tags) LIKE LOWER(CONCAT('%', :tag, '%'))")
    Page<Snippet> findPublicSnippetsByTag(@Param("tag") String tag, Pageable pageable);
}
