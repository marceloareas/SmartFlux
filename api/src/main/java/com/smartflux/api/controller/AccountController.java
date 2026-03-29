package com.smartflux.api.controller;

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

import com.smartflux.api.model.Account;
import com.smartflux.api.service.AccountService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
@Tag(name = "Contas", description = "Endpoints para gestão de contas")
public class AccountController {

    private final AccountService accountService;

    // GET ------------------------------------------------------------------
    @GetMapping
    public ResponseEntity<List<Account>> findAllAccount() {
        List<Account> listAccounts = accountService.findAllAccount();
        return ResponseEntity.ok().body(listAccounts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> findAccountById(@PathVariable UUID id) {
        Account account = accountService.findAccountById(id);
        return ResponseEntity.ok().body(account);
    }

    // POST ------------------------------------------------------------------
    @PostMapping
    public ResponseEntity<Account> insertAccount(@RequestBody Account account) {
        Account newAccount = accountService.insertAccount(account);
        return ResponseEntity.ok().body(newAccount);
    }

    // DELETE ------------------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable UUID id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }

    // PUT ------------------------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<Account> updateAccount(@PathVariable UUID id, @RequestBody Account account) {
        Account account2 = accountService.updateAccount(id, account);
        return ResponseEntity.ok().body(account2);
    }

    // PATCH ------------------------------------------------------------------
    
}
