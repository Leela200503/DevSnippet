package com.devsnippet.controller;

import com.devsnippet.model.dto.SnippetRequest;
import com.devsnippet.model.dto.SnippetResponse;
import com.devsnippet.service.SnippetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/snippets")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class SnippetController {

    @Autowired
    private SnippetService snippetService;

    @PostMapping
    public ResponseEntity<SnippetResponse> createSnippet(
            @Valid @RequestBody SnippetRequest snippetRequest,
            Authentication authentication) {

        if (authentication == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        SnippetResponse response = snippetService.createSnippet(snippetRequest, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SnippetResponse> getSnippet(
            @PathVariable Long id,
            Authentication authentication) {

        SnippetResponse response = snippetService.getSnippetById(id, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<Page<SnippetResponse>> getUserSnippets(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(snippetService.getUserSnippets(id, pageable));
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<SnippetResponse>> getFavoriteSnippets(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(snippetService.getFavoriteSnippets(authentication.getName()));
    }

    @GetMapping("/user/all")
    public ResponseEntity<Page<SnippetResponse>> getUserSnippets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        Pageable pageable = PageRequest.of(page, size);
        Page<SnippetResponse> response = snippetService.getUserSnippets(authentication.getName(), pageable);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/user/search")
    public ResponseEntity<Page<SnippetResponse>> searchUserSnippets(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String language,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        Pageable pageable = PageRequest.of(page, size);
        Page<SnippetResponse> response = snippetService.searchUserSnippets(
                authentication.getName(), title, language, pageable);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/public")
    public ResponseEntity<Page<SnippetResponse>> getPublicSnippets(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        Pageable pageable = PageRequest.of(page, size);
        String currentUserEmail = (authentication != null) ? authentication.getName() : null;
        Page<SnippetResponse> response = snippetService.getPublicSnippets(title, language, tag, pageable, currentUserEmail);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SnippetResponse> updateSnippet(
            @PathVariable Long id,
            @Valid @RequestBody SnippetRequest snippetRequest,
            Authentication authentication) {

        if (authentication == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        SnippetResponse response = snippetService.updateSnippet(id, snippetRequest, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSnippet(
            @PathVariable Long id,
            Authentication authentication) {

        if (authentication == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        snippetService.deleteSnippet(id, authentication.getName());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
