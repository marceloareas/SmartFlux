package com.smartflux.api.service;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

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

    public List<Transaction> findAllTransaction() {
        return transactionRepository.findAll();
    }

    public Transaction findTransactionById(UUID id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));
    }

    @Transactional
    public Transaction insertTransaction(Transaction transaction) {
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());
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

        transaction.setAccount(transactionDetails.getAccount());
        transaction.setCategory(transactionDetails.getCategory());
        transaction.setAmount(transactionDetails.getAmount());
        transaction.setType(transactionDetails.getType());
        transaction.setDate(transactionDetails.getDate());
        transaction.setDescription(transactionDetails.getDescription());
        transaction.setUpdatedAt(LocalDateTime.now());

        Transaction result = transactionRepository.save(transaction);
        log.info("Transação atualizada com sucesso no banco de dados. ID: {}", result.getId());
        return result;
    }
}
