package com.devsnippet.repository;

import com.devsnippet.model.entity.Comment;
import com.devsnippet.model.entity.Snippet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findBySnippetOrderByCreatedAtDesc(Snippet snippet);
    long countBySnippet(Snippet snippet);
}
