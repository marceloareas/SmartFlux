package com.smartflux.api.service;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

import org.springframework.security.core.context.SecurityContextHolder;
import com.smartflux.api.config.JWTUserData;
import org.springframework.stereotype.Service;

import com.smartflux.api.model.Transaction;
import com.smartflux.api.repository.TransactionRepository;
import com.smartflux.api.service.exceptionsCustom.ResourceNotFoundException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final CategoryService categoryService;

    private UUID getCurrentUserId() {
        JWTUserData userData = (JWTUserData) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(userData.userId());
    }

    public List<Transaction> findAllTransaction() {
        return transactionRepository.findByAccountUserId(getCurrentUserId());
    }

    public Transaction findTransactionById(UUID id) {
        return transactionRepository.findByIdAndAccountUserId(id, getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));
    }

    @Transactional
    public Transaction insertTransaction(Transaction transaction) {
        transaction.setId(null);
        // Verify account belongs to user
        accountService.findAccountById(transaction.getAccount().getId());
        // Verify category belongs to user if present
        if (transaction.getCategory() != null && transaction.getCategory().getId() != null) {
            categoryService.findCategoryById(transaction.getCategory().getId());
        }

        Transaction saved = transactionRepository.save(transaction);
        log.info("Transação salva com sucesso no banco de dados. ID: {}", saved.getId());
        return saved;
    }

    @Transactional
    public void deleteTransaction(UUID id) {
        findTransactionById(id);
        transactionRepository.deleteById(id);
    }

    @Transactional
    public Transaction updateTransaction(UUID id, Transaction transactionDetails) {
        Transaction transaction = findTransactionById(id);

        // Verify elements belong to user
        if (transactionDetails.getAccount() != null) {
            accountService.findAccountById(transactionDetails.getAccount().getId());
            transaction.setAccount(transactionDetails.getAccount());
        }
        if (transactionDetails.getCategory() != null) {
            categoryService.findCategoryById(transactionDetails.getCategory().getId());
            transaction.setCategory(transactionDetails.getCategory());
        }

        transaction.setAmount(transactionDetails.getAmount());
        transaction.setDescription(transactionDetails.getDescription());
        transaction.setUpdatedAt(LocalDateTime.now());

        Transaction result = transactionRepository.save(transaction);
        log.info("Transação atualizada com sucesso no banco de dados. ID: {}", result.getId());
        return result;
    }
}
