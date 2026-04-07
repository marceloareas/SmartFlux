package com.smartflux.api.service;

import org.springframework.stereotype.Service;

import com.smartflux.api.dto.request.LoginRequest;
import com.smartflux.api.model.User;
import com.smartflux.api.service.exceptionsCustom.InvalidPasswordException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;

    public String authLogin(LoginRequest request) {
        String email = request.email();
        String password = request.password();

        User user = userService.findUserByEmail(email);

        if (!user.getPasswordHash().equals(password)) {
            throw new InvalidPasswordException("Senha inválida");
        }
        return user.getId().toString();
    }

    

}
