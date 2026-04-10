package com.smartflux.api.service;

import java.util.List;
import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;
import com.smartflux.api.config.JWTUserData;
import com.smartflux.api.service.exceptionsCustom.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import com.smartflux.api.model.Account;
import com.smartflux.api.model.User;
import com.smartflux.api.repository.AccountRepository;
import com.smartflux.api.service.exceptionsCustom.ResourceNotFoundException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class AccountService {
    private UUID getCurrentUserId() {
        JWTUserData userData = (JWTUserData) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(userData.userId());
    }

    private final AccountRepository accountRepository;

    // GET ------------------------------------------------------------------
    public List<Account> findAllAccount() {
        List<Account> listAccounts = accountRepository.findByUserId(getCurrentUserId());
        return listAccounts;
    }

    public Account findAccountById(UUID id) {
        Account account = accountRepository.findByIdAndUserId(id, getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));
        return account;
    }

    // POST ------------------------------------------------------------------

    public Account insertAccount(Account account) {
        account.setId(null);
        Account newAccount = new Account();
        User currentUser = new User();
        currentUser.setId(getCurrentUserId());
        newAccount.setUser(currentUser);
        newAccount.setName(account.getName());
        newAccount.setColor(account.getColor());
        newAccount.setCurrency(account.getCurrency());
        return accountRepository.save(newAccount);
    }

    // Método auxiliar para criar conta padrão
    public Account createDefaultAccount(User user) {
        Account account = new Account();
        account.setId(null);
        account.setUser(user);
        account.setName("Conta Padrão");
        return accountRepository.save(account);
    }

    // DELETE ------------------------------------------------------------------
    public void deleteAccount(UUID id) {
        findAccountById(id);
        accountRepository.deleteById(id);
    }

    // PUT ------------------------------------------------------------------

    @Transactional
    public Account updateAccount(UUID id, Account account) {
        Account newAccount = findAccountById(id);

        newAccount.setName(account.getName());
        newAccount.setColor(account.getColor());
        newAccount.setCurrency(account.getCurrency());

        return newAccount;
    }
}
