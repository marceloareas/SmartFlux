package com.smartflux.api.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.smartflux.api.model.Transaction;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class LlmForecastService {

    private final TransactionService transactionService;

    @Value("${smartflux.llm.url:http://localhost:8000}")
    private String llmServiceUrl;

    public ForecastResponse getForecast(String type, int horizon) {
        // Fetch all transactions for current user
        List<Transaction> transactions = transactionService.findAllTransaction();

        // Filter: only completed transactions (status = 1) in the past or present
        List<Transaction> historicalTxs = transactions.stream()
                .filter(t -> t.getStatus() == 1 && t.getCompetenceDate().isBefore(LocalDateTime.now()))
                .collect(Collectors.toList());

        if (historicalTxs.isEmpty()) {
            throw new IllegalArgumentException("Nenhuma transação concluída encontrada no histórico para realizar a previsão.");
        }

        // Group by Year-Month (yyyy-MM)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, BigDecimal> monthlyData = new TreeMap<>(); // TreeMap guarantees chronological sorting

        for (Transaction t : historicalTxs) {
            String monthKey = t.getCompetenceDate().format(formatter);
            BigDecimal amount = t.getAmount();
            boolean isIncome = t.getDirection() != null && t.getDirection();

            BigDecimal currentVal = monthlyData.getOrDefault(monthKey, BigDecimal.ZERO);
            if ("income".equalsIgnoreCase(type)) {
                if (isIncome) {
                    monthlyData.put(monthKey, currentVal.add(amount));
                }
            } else if ("expense".equalsIgnoreCase(type)) {
                if (!isIncome) {
                    monthlyData.put(monthKey, currentVal.add(amount));
                }
            } else { // default to net balance (balance)
                if (isIncome) {
                    monthlyData.put(monthKey, currentVal.add(amount));
                } else {
                    monthlyData.put(monthKey, currentVal.subtract(amount));
                }
            }
        }

        // Convert grouped data to DataPoint list
        List<DataPoint> series = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : monthlyData.entrySet()) {
            series.add(new DataPoint(entry.getKey(), entry.getValue().doubleValue()));
        }

        log.info("Série histórica formatada para previsão ({}): {}", type, series);

        if (series.size() < 3) {
            throw new IllegalArgumentException("Histórico insuficiente. São necessários dados de pelo menos 3 meses distintos para realizar a previsão.");
        }

        // Prepare request for FastAPI
        ForecastRequest requestPayload = new ForecastRequest(horizon, series);

        // Force HTTP/1.1 to prevent Uvicorn from failing with "Unsupported upgrade request" on HTTP/2 cleartext upgrade
        java.net.http.HttpClient httpClient = java.net.http.HttpClient.newBuilder()
                .version(java.net.http.HttpClient.Version.HTTP_1_1)
                .build();
        org.springframework.http.client.JdkClientHttpRequestFactory requestFactory = 
                new org.springframework.http.client.JdkClientHttpRequestFactory(httpClient);

        // Call FastAPI using RestClient
        RestClient restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .baseUrl(llmServiceUrl)
                .build();

        try {
            log.info("Enviando requisição de previsão para o serviço LLM em: {}/predict", llmServiceUrl);
            ForecastResponse response = restClient.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestPayload)
                    .retrieve()
                    .body(ForecastResponse.class);

            if (response == null) {
                throw new RuntimeException("Resposta nula recebida do serviço de previsão.");
            }

            return response;
        } catch (Exception e) {
            log.error("Erro ao chamar o serviço LLM de previsão", e);
            throw new RuntimeException("Erro ao comunicar com o serviço de previsão de inteligência artificial: " + e.getMessage(), e);
        }
    }

    // DTO records for API request/response mapping
    public record DataPoint(String month, double value) {}
    
    public record ForecastRequest(int horizon, List<DataPoint> series) {}

    public record PredictionPoint(String month, double predicted) {}

    public record ForecastResponse(
            int input_points,
            int forecast_horizon,
            List<PredictionPoint> predictions
    ) {}
}
