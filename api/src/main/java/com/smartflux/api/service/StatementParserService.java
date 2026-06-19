package com.smartflux.api.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.smartflux.api.model.Account;
import com.smartflux.api.model.Transaction;

@Service
public class StatementParserService {

    private static final Logger log = LoggerFactory.getLogger(StatementParserService.class);

    public List<Transaction> parseTransactions(MultipartFile file, Account account) throws IOException {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (!filename.endsWith(".ofx") && !filename.endsWith(".xml")) {
            throw new IllegalArgumentException("Formato de arquivo não suportado: " + filename);
        }

        List<Transaction> result = new ArrayList<>();
        try {
            // Jsoup handles both OFX and XML perfectly, ignoring missing closing tags
            Document doc = Jsoup.parse(file.getInputStream(), StandardCharsets.UTF_8.name(), "", org.jsoup.parser.Parser.xmlParser());
            
            // Look for OFX standard STMTTRN or generic XML Transaction
            Elements txElements = doc.select("STMTTRN, Transaction");
            
            for (Element txElement : txElements) {
                Transaction tx = new Transaction();
                tx.setAccount(account);
                
                String memo = txElement.select("MEMO, Description").text();
                tx.setDescription(!memo.isEmpty() ? memo : "Transação OFX/XML");

                String amountStr = txElement.select("TRNAMT, Amount").text();
                if (!amountStr.isEmpty()) {
                    try {
                        double amount = Double.parseDouble(amountStr.replace(",", "."));
                        tx.setAmount(new BigDecimal(Math.abs(amount)));
                        tx.setDirection(amount >= 0);
                    } catch (NumberFormatException e) {
                        tx.setAmount(BigDecimal.ZERO);
                        tx.setDirection(false);
                    }
                } else {
                    tx.setAmount(BigDecimal.ZERO);
                    tx.setDirection(false);
                }
                
                String dateStr = txElement.select("DTPOSTED, Date").text();
                if (!dateStr.isEmpty()) {
                    try {
                        if (dateStr.length() >= 14 && dateStr.contains("T")) {
                            // XML ISO format like 2026-06-10T09:00:00
                            tx.setCompetenceDate(LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                        } else if (dateStr.length() >= 14) { // OFX format YYYYMMDDHHMMSS
                            String cleanDate = dateStr.substring(0, 14);
                            tx.setCompetenceDate(LocalDateTime.parse(cleanDate, DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
                        } else if (dateStr.length() == 8) { // OFX format YYYYMMDD
                            tx.setCompetenceDate(LocalDateTime.parse(dateStr + "000000", DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
                        } else {
                            tx.setCompetenceDate(LocalDateTime.now());
                        }
                    } catch (Exception e) {
                        tx.setCompetenceDate(LocalDateTime.now());
                    }
                } else {
                    tx.setCompetenceDate(LocalDateTime.now());
                }

                tx.setStatus(1); // 1 = concluída
                tx.setCreatedAt(LocalDateTime.now());
                tx.setUpdatedAt(LocalDateTime.now());
                result.add(tx);
            }
        } catch (Exception e) {
            log.error("Erro ao fazer parse do OFX/XML", e);
            throw new IOException("Falha ao processar OFX/XML", e);
        }
        return result;
    }
}
