package com.smartflux.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartflux.api.dto.request.LoginRequest;
import com.smartflux.api.dto.request.RefreshTokenRequest;
import com.smartflux.api.dto.request.RegisterRequest;
import com.smartflux.api.dto.response.LoginResponse;
import com.smartflux.api.dto.response.RegisterResponse;
import com.smartflux.api.model.Session;
import com.smartflux.api.model.User;
import com.smartflux.api.service.SessionService;
import com.smartflux.api.service.UserService;
import com.smartflux.api.config.TokenConfig;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Endpoints de autenticação")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenConfig tokenConfig;
    private final SessionService sessionService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        UsernamePasswordAuthenticationToken userAndPass = new UsernamePasswordAuthenticationToken(loginRequest.email(),
                loginRequest.password());
        Authentication authentication = authenticationManager.authenticate(userAndPass);
        User user = (User) authentication.getPrincipal();

        String accessToken = tokenConfig.generateToken(user);

        String ip = request.getRemoteAddr();
        String agent = request.getHeader("User-Agent");
        String refreshToken = sessionService.createSession(user, ip, agent);

        return ResponseEntity.ok(new LoginResponse(accessToken, refreshToken));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        User newUser = new User(); // Já cria um ID
        newUser.setName(registerRequest.name());
        newUser.setEmail(registerRequest.email());
        newUser.setPasswordHash(passwordEncoder.encode(registerRequest.password()));

        userService.insertUser(newUser);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RegisterResponse(newUser.getName(), newUser.getEmail()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@Valid @RequestBody RefreshTokenRequest request, HttpServletRequest requestInfo) {
        Session session = sessionService.validateAndGetSession(request.refreshToken());
        User user = session.getUser();

        String newAccessToken = tokenConfig.generateToken(user);
        
        String ip = requestInfo.getRemoteAddr();
        String agent = requestInfo.getHeader("User-Agent");
        String newRefreshToken = sessionService.rotateSession(request.refreshToken(), ip, agent);

        return ResponseEntity.ok(new LoginResponse(newAccessToken, newRefreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        sessionService.revokeSession(request.refreshToken());
        return ResponseEntity.noContent().build();
    }
}
