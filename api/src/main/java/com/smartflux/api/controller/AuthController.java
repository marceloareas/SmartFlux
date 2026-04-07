package com.smartflux.api.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartflux.api.dto.request.LoginRequest;
import com.smartflux.api.dto.response.LoginResponse;
import com.smartflux.api.model.User;
import com.smartflux.api.service.AuthService;
import com.smartflux.api.service.UserService;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Endpoints de autenticação")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        String token = authService.authLogin(request);
        User user = userService.findUserByEmail(request.email());
        return ResponseEntity.ok(new LoginResponse(token, user.getId().toString(), user.getEmail()));
    }

    @GetMapping("/me/{token}")
    public ResponseEntity<LoginResponse> me(@PathVariable String token) {
        try {
            UUID id = UUID.fromString(token);
            User user = userService.findUserById(id);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            return ResponseEntity.ok(new LoginResponse(
                    token,
                    user.getId().toString(),
                    user.getEmail()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
