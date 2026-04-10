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
import com.smartflux.api.dto.request.RegisterRequest;
import com.smartflux.api.dto.response.LoginResponse;
import com.smartflux.api.dto.response.RegisterResponse;
import com.smartflux.api.model.User;
import com.smartflux.api.service.UserService;
import com.smartflux.api.config.TokenConfig;

import io.swagger.v3.oas.annotations.tags.Tag;
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

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        //Autenticar usuário pela senha e pelo email.
        //Pega a senha do usuário no banco de dados e compara com a senha enviada pelo usuário.
        //Se a senha for igual, gera um token e retorna para o usuário.
        //Se a senha for diferente, retorna um erro.

        UsernamePasswordAuthenticationToken userAndPass = new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password());
        Authentication authentication = authenticationManager.authenticate(userAndPass);

        User user = (User) authentication.getPrincipal(); //Pega o usuário autenticado
        String token = tokenConfig.generateToken(user); //Gera o token

        return ResponseEntity.ok(new LoginResponse(token));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        User newUser = new User(); //Já cria um ID
        newUser.setName(registerRequest.name());
        newUser.setEmail(registerRequest.email());
        newUser.setPasswordHash(passwordEncoder.encode(registerRequest.password()));

        userService.insertUser(newUser);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(new RegisterResponse(newUser.getName(), newUser.getEmail()));
    }
}
