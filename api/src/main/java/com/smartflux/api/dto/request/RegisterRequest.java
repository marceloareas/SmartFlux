package com.smartflux.api.dto.request;

import jakarta.validation.constraints.NotEmpty;

public record RegisterRequest(
        @NotEmpty(message = "Nome é obrigatório")
        String name,
        @NotEmpty(message = "Email é obrigatório")
        String email,
        @NotEmpty(message = "Senha é obrigatória")
        String password) {
}
