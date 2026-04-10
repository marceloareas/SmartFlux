package com.smartflux.api.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import org.springframework.stereotype.Service;

import com.smartflux.api.model.Session;
import com.smartflux.api.model.User;
import com.smartflux.api.repository.SessionRepository;
import com.smartflux.api.util.HashUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;

    // Cria a sessão e devolve uma string limpa do refreshToken para entregar ao
    // Frontend
    public String createSession(User user, String ipAddress, String userAgent) {
        SecureRandom secureRandom = new SecureRandom();
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        Session session = new Session();
        session.setUser(user);
        session.setRefreshTokenHash(HashUtil.sha256(rawToken));
        session.setIpAddress(ipAddress);
        session.setUserAgent(userAgent);

        sessionRepository.save(session);
        return rawToken;
    }

    public Session validateAndGetSession(String rawToken) {
        Session session = sessionRepository.findByRefreshTokenHash(HashUtil.sha256(rawToken))
                .orElseThrow(() -> new RuntimeException("Refresh Token Inexistente"));

        if (session.getRevokedAt() != null) {
            throw new RuntimeException("Sessão revogada.");
        }
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Sessão expirada. Faça login novamente.");
        }
        return session;
    }

    // Rotaciona a sessão (Utilizado no Refresh)
    public String rotateSession(String rawToken, String ipAddress, String userAgent) {
        Session oldSession = validateAndGetSession(rawToken);
        oldSession.setRevokedAt(LocalDateTime.now());
        sessionRepository.save(oldSession);

        return createSession(oldSession.getUser(), ipAddress, userAgent);
    }

    // Revoga a sessão (Utilizado no Logout)
    public void revokeSession(String rawToken) {
        Session session = validateAndGetSession(rawToken);
        session.setRevokedAt(LocalDateTime.now());
        sessionRepository.save(session);
    }
}