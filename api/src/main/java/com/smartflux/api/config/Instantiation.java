package com.smartflux.api.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import com.smartflux.api.model.Account;
import com.smartflux.api.model.Category;
import com.smartflux.api.model.Transaction;
import com.smartflux.api.model.User;
import com.smartflux.api.model.enums.Currency;
import com.smartflux.api.repository.AccountRepository;
import com.smartflux.api.repository.CategoryRepository;
import com.smartflux.api.repository.TransactionRepository;
import com.smartflux.api.repository.SessionRepository;
import com.smartflux.api.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class Instantiation implements CommandLineRunner {

        private final AccountRepository accountRepository;
        private final CategoryRepository categoryRepository;
        private final TransactionRepository transactionRepository;
        private final SessionRepository sessionRepository;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final net.datafaker.Faker faker;

        @Override
        public void run(String... args) throws Exception {

                sessionRepository.deleteAll();
                transactionRepository.deleteAll();
                accountRepository.deleteAll();
                categoryRepository.deleteAll();
                userRepository.deleteAll();

                // USER ------------------------------------------
                User mainUser = new User("Marcelo", "marcelo@gmail.com", passwordEncoder.encode("123456"));
                userRepository.save(mainUser);

                // ACCOUNT ------------------------------------------
                List<Account> accounts = new ArrayList<>();
                accounts.add(new Account(mainUser, faker.company().name() + " Bank", faker.color().hex(),
                                Currency.BRL));
                accountRepository.saveAll(accounts);

                // CATEGORY ------------------------------------------
                List<Category> categories = new ArrayList<>();
                for (int i = 0; i < 10; i++) {
                        categories.add(new Category(mainUser, faker.commerce().department(), faker.color().hex()));
                }
                categoryRepository.saveAll(categories);

                // TRANSACTION ------------------------------------------
                LocalDateTime now = LocalDateTime.now();
                List<Transaction> transactions = new ArrayList<>();

                for (Account acc : accounts) {
                        // 8 meses para trás (-8), mês atual (0), e 3 para frente (+3) = 12 meses
                        for (int monthOffset = -8; monthOffset <= 3; monthOffset++) {
                                LocalDateTime baseDate = now.plusMonths(monthOffset);
                                // Sorteia entre 38 e 45 transações por mês (totalizando ~500 ao longo de 12
                                // meses)
                                int numTransactions = faker.number().numberBetween(160, 175);
                                for (int i = 0; i < numTransactions; i++) {
                                        Category cat = categories
                                                        .get(faker.number().numberBetween(0, categories.size()));
                                        boolean isIncome = faker.number().numberBetween(1, 100) <= 7;
                                        double amount = faker.number().randomDouble(2, 10, isIncome ? 5000 : 350);
                                        String description = faker.commerce().productName();
                                        int day = faker.number().numberBetween(1, 28);
                                        LocalDateTime date = baseDate.withDayOfMonth(day);

                                        int status = (monthOffset < 0) ? 1
                                                        : (monthOffset == 0 ? faker.number().numberBetween(0, 2) : 0);

                                        transactions.add(new Transaction(acc, cat, isIncome, BigDecimal.valueOf(amount),
                                                        description, date, date, status));
                                }
                        }
                }
                transactionRepository.saveAll(transactions);
        }
}
