package com.devsnippet.service;

import com.devsnippet.exception.BadRequestException;
import com.devsnippet.exception.ResourceNotFoundException;
import com.devsnippet.model.dto.AuthRequest;
import com.devsnippet.model.dto.AuthResponse;
import com.devsnippet.model.dto.LoginRequest;
import com.devsnippet.model.dto.UserDTO;
import com.devsnippet.model.entity.User;
import com.devsnippet.repository.UserRepository;
import com.devsnippet.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse register(AuthRequest authRequest) {
        // Check if user already exists
        if (userRepository.existsByEmail(authRequest.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        // Create new user
        User user = User.builder()
                .email(authRequest.getEmail())
                .name(authRequest.getName())
                .password(passwordEncoder.encode(authRequest.getPassword()))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        // Generate token
        String token = jwtTokenProvider.generateTokenFromUsername(authRequest.getEmail());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationTime())
                .user(convertToDTO(user))
                .build();
    }

    public AuthResponse login(LoginRequest loginRequest) {
        // Authenticate
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            String token = jwtTokenProvider.generateToken(authentication);

            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            return AuthResponse.builder()
                    .token(token)
                    .type("Bearer")
                    .expiresIn(jwtTokenProvider.getExpirationTime())
                    .user(convertToDTO(user))
                    .build();
        } catch (Exception ex) {
            throw new BadRequestException("Invalid email or password");
        }
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return convertToDTO(user);
    }

    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        return convertToDTO(user);
    }

    public User getUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public void updateProfile(String email, String name, String bio) {
        User user = getUserEntityByEmail(email);
        if (name != null) user.setName(name);
        if (bio != null) user.setBio(bio);
        userRepository.save(user);
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .build();
    }
}
