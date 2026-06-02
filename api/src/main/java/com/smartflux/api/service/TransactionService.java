package com.smartflux.api.service;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

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
        transaction.setCompetenceDate(transactionDetails.getCompetenceDate());
        transaction.setDirection(transactionDetails.getDirection());
        transaction.setStatus(transactionDetails.getStatus());
        transaction.setUpdatedAt(LocalDateTime.now());

        Transaction result = transactionRepository.save(transaction);
        log.info("Transação atualizada com sucesso no banco de dados. ID: {}", result.getId());
        return result;
    }

    public String exportReportAsCsv(Integer month, Integer year, String startDate, String endDate) {
        LocalDateTime start;
        LocalDateTime end;

        if (startDate != null && endDate != null) {
            start = java.time.LocalDate.parse(startDate).atStartOfDay();
            end = java.time.LocalDate.parse(endDate).atTime(23, 59, 59, 999999999);
        } else if (month != null && year != null) {
            YearMonth yearMonth = YearMonth.of(year, month);
            start = yearMonth.atDay(1).atStartOfDay();
            end = yearMonth.atEndOfMonth().atTime(23, 59, 59, 999999999);
        } else {
            YearMonth yearMonth = YearMonth.now();
            start = yearMonth.atDay(1).atStartOfDay();
            end = yearMonth.atEndOfMonth().atTime(23, 59, 59, 999999999);
        }

        List<Transaction> transactions = transactionRepository.findByAccountUserIdAndCompetenceDateBetween(
                getCurrentUserId(), start, end);

        StringBuilder csvBuilder = new StringBuilder();
        // Cabeçalho do CSV
        csvBuilder.append("ID,Data,Descrição,Conta,Categoria,Tipo,Valor,Status\n");

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        for (Transaction t : transactions) {
            String idStr = t.getId() != null ? t.getId().toString() : "";
            String dateStr = t.getCompetenceDate() != null ? t.getCompetenceDate().format(dateFormatter) : "";

            // Tratando vírgulas e aspas na descrição para não quebrar o CSV
            String description = t.getDescription() != null ? t.getDescription().replace("\"", "\"\"") : "";
            if (description.contains(",") || description.contains("\n")) {
                description = "\"" + description + "\"";
            }

            String accountName = t.getAccount() != null && t.getAccount().getName() != null ? t.getAccount().getName()
                    : "";
            String categoryName = t.getCategory() != null && t.getCategory().getName() != null
                    ? t.getCategory().getName()
                    : "";

            String direction = t.getDirection() != null && t.getDirection() ? "Receita" : "Despesa";
            String amount = t.getAmount() != null ? t.getAmount().toString() : "0.00";

            String status = "Desconhecido";
            switch (t.getStatus()) {
                case 0:
                    status = "Pendente";
                    break;
                case 1:
                    status = "Concluída";
                    break;
                case 2:
                    status = "Cancelada";
                    break;
            }

            csvBuilder.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s\n",
                    idStr, dateStr, description, accountName, categoryName, direction, amount, status));
        }

        return csvBuilder.toString();
    }
}
