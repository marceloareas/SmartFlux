package com.smartflux.api.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartflux.api.model.Transaction;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByAccountUserId(UUID userId);

    Optional<Transaction> findByIdAndAccountUserId(UUID id, UUID userId);
}
