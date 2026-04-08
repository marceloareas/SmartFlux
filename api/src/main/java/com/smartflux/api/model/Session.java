package com.smartflux.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "sessions")
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @Column(nullable = false, name = "user_id")
    private User user;

    @Column(nullable = false, name = "refresh_token_hash")
    private String refreshTokenHash;

    @Column(nullable = true, name = "user_agent")
    private String userAgent;

    @Column(nullable = true, name = "ip_address")
    private String ipAddress;

    @Column(nullable = true, name = "revoked_at")
    private LocalDateTime revokedAt;

    @CreationTimestamp
    @Column(nullable = false, name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, name = "expires_at")
    private LocalDateTime expiresAt = createdAt.plusDays(30);
}
