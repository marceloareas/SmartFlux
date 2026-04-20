package com.smartflux.api.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartflux.api.model.Transaction;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByAccountUserId(UUID userId);

    List<Transaction> findByAccountUserIdAndCompetenceDateBetween(UUID userId, LocalDateTime start, LocalDateTime end);

    Optional<Transaction> findByIdAndAccountUserId(UUID id, UUID userId);
}
