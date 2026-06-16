package com.smartflux.api.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
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

    @PostMapping(value = "/import/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> previewImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("accountId") UUID accountId) {
        log.info("Recebendo requisição para pré-visualizar importação de arquivo para a conta {}", accountId);
        try {
            List<Transaction> preview = transactionService.previewFromStatement(file, accountId);
            return ResponseEntity.ok().body(preview);
        } catch (Exception e) {
            log.error("Erro ao pré-visualizar arquivo", e);
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage() != null ? e.getMessage() : "Erro desconhecido"));
        }
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importFromStatement(
            @RequestParam("file") MultipartFile file,
            @RequestParam("accountId") UUID accountId,
            @RequestParam(value = "selectedIndices", required = false) List<Integer> selectedIndices) {
        log.info("Recebendo requisição para importar transações via arquivo (OFX/XML) para a conta {} com {} indices selecionados", accountId, selectedIndices != null ? selectedIndices.size() : "todos os");
        try {
            List<Transaction> imported = transactionService.importFromStatement(file, accountId, selectedIndices);
            return ResponseEntity.ok().body(imported);
        } catch (Exception e) {
            log.error("Erro ao importar arquivo", e);
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage() != null ? e.getMessage() : "Erro desconhecido"));
        }
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportMonthlyReport(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        log.info("Recebendo requisição para exportar relatório das transacoes. Mês: {}, Ano: {}, Start: {}, End: {}", month, year, startDate, endDate);

        String csvData = transactionService.exportReportAsCsv(month, year, startDate, endDate);
        byte[] csvBytes = csvData.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=utf-8"));
        // Adicionando BOM para leitura correta de acentuação no Excel
        byte[] bom = new byte[] { (byte) 0xEF, (byte) 0xBB, (byte) 0xBF };
        byte[] contentWithBom = new byte[bom.length + csvBytes.length];
        System.arraycopy(bom, 0, contentWithBom, 0, bom.length);
        System.arraycopy(csvBytes, 0, contentWithBom, bom.length, csvBytes.length);

        String filename;
        if (startDate != null && endDate != null) {
            filename = "relatorio_transacoes_" + startDate + "_" + endDate + ".csv";
        } else {
            filename = "relatorio_transacoes_" + (month != null ? month : "todos") + "_" + (year != null ? year : "todos") + ".csv";
        }

        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");

        return ResponseEntity.ok()
                .headers(headers)
                .body(contentWithBom);
    }
}
