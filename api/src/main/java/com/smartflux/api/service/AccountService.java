package com.smartflux.api.service;

import java.util.List;
import java.util.UUID;

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

    private final AccountRepository accountRepository;

    // GET ------------------------------------------------------------------
    public List<Account> findAllAccount() {
        List<Account> listAccounts = accountRepository.findAll();
        return listAccounts;
    }

    public Account findAccountById(UUID id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));
        return account;
    }

    // POST ------------------------------------------------------------------

    public Account insertAccount(Account account) {
        account.setId(null);
        Account newAccount = new Account();
        newAccount.setUser(account.getUser());
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
