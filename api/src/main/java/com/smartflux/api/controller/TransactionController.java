package com.smartflux.api.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.smartflux.api.model.Transaction;
import com.smartflux.api.service.TransactionService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@Tag(name = "Transações", description = "Endpoints para gestão de transações")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<Transaction>> findAllTransaction() {
        List<Transaction> listTransactions = transactionService.findAllTransaction();
        return ResponseEntity.ok().body(listTransactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> findTransactionById(@PathVariable UUID id) {
        Transaction transaction = transactionService.findTransactionById(id);
        return ResponseEntity.ok().body(transaction);
    }

    @PostMapping
    public ResponseEntity<Void> insertTransaction(@RequestBody Transaction transaction) {
        log.info("Recebendo requisição para inserir nova transação: {}", transaction);
        Transaction newTransaction = transactionService.insertTransaction(transaction);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(newTransaction.getId()).toUri();
        return ResponseEntity.created(uri).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable UUID id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable UUID id, @RequestBody Transaction transaction) {
        log.info("Recebendo requisição para atualizar transação ID {}: {}", id, transaction);
        Transaction updatedTransaction = transactionService.updateTransaction(id, transaction);
        return ResponseEntity.ok().body(updatedTransaction);
    }
}
