package com.smartflux.api.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.smartflux.api.model.PasswordResetToken;
import com.smartflux.api.model.User;
import com.smartflux.api.repository.PasswordResetTokenRepository;
import com.smartflux.api.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void requestPasswordReset(String email) {
        // Busca o usuário pelo e-mail - silenciosamente retorna sem erro se não encontrado
        // (por segurança, não revelamos se o e-mail existe ou não)
        userRepository.findUserByEmail(email).ifPresent(userDetails -> {
            User user = (User) userDetails;

            // Gera um token único
            String token = UUID.randomUUID().toString();

            // Salva o token no banco com expiração de 30 minutos
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(token);
            resetToken.setUser(user);
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));
            resetToken.setUsed(false);
            tokenRepository.save(resetToken);

            // Envia o e-mail
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
            log.info("Solicitação de redefinição de senha gerada para: {}", email);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token inválido ou não encontrado."));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("Este link de redefinição já foi utilizado.");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Este link de redefinição expirou. Solicite um novo.");
        }

        // Atualiza a senha do usuário
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Invalida o token
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Senha redefinida com sucesso para o usuário: {}", user.getEmail());
    }
}
