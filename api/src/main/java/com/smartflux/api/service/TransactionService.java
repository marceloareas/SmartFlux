package com.smartflux.api.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.smartflux.api.model.Transaction;
import com.smartflux.api.repository.TransactionRepository;
import com.smartflux.api.service.exceptionsCustom.ResourceNotFoundException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

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
        return transactionRepository.save(transaction);
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

        return transactionRepository.save(transaction);
    }
}
