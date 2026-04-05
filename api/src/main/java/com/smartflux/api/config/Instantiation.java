package com.smartflux.api.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import com.smartflux.api.model.Account;
import com.smartflux.api.model.User;
import com.smartflux.api.model.enums.Currency;
import com.smartflux.api.repository.AccountRepository;
import com.smartflux.api.repository.UserRepository;


import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class Instantiation implements CommandLineRunner {

        private final AccountRepository accountRepository;
        private final UserRepository userRepository;
        
        @Override
        public void run(String... args) throws Exception {

                //Deletar sempre na ordem inversa da criação
                accountRepository.deleteAll();
                userRepository.deleteAll();

                // USER ------------------------------------------

                User u1 = new User("Marcelo Areas", "marcelo.rodrigues@cefet-rj.br", "123456", "America/Sao_Paulo");

                userRepository.save(u1);

                // ACCOUNT ------------------------------------------

                Account a1 = new Account(u1, "Conta Padrão", "#26c226ff", Currency.BRL);

                accountRepository.save(a1);

                // CATEGORY ------------------------------------------


                // TRANSACTION ------------------------------------------
        }
}
