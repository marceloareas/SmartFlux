package com.smartflux.api.config;

import java.time.Instant;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.smartflux.api.model.User;

@Component
public class TokenConfig {
    private String secret = "secret";

    private Algorithm algorithm = Algorithm.HMAC256(secret);

    public String generateToken(User user) {
        return JWT.create()
                .withClaim("UserId", user.getId().toString()) // UUID -> String
                .withSubject(user.getEmail())
                .withExpiresAt(Instant.now().plusSeconds(60 * 60)) // 1 hora
                .withIssuedAt(Instant.now())// Hora que foi gerado
                .sign(algorithm);
    }

    public Optional<JWTUserData> validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            DecodedJWT decodedJWT = JWT.require(algorithm)
                    .build()
                    .verify(token);
            return Optional.of(JWTUserData.builder()
                .userId(decodedJWT.getClaim("UserId").asString())
                .email(decodedJWT.getSubject())
                .build());
        } catch (JWTVerificationException ex) {
            return Optional.empty();
        }
    }   
}
