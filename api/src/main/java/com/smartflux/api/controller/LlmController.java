package com.smartflux.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartflux.api.service.LlmForecastService;
import com.smartflux.api.service.LlmForecastService.ForecastResponse;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/llm")
@RequiredArgsConstructor
@Tag(name = "Previsão IA", description = "Endpoints para previsão de transações usando inteligência artificial")
public class LlmController {

    private final LlmForecastService llmForecastService;

    @GetMapping("/predict")
    public ResponseEntity<ForecastResponse> getForecast(
            @RequestParam(defaultValue = "balance") String type,
            @RequestParam(defaultValue = "3") int horizon) {
        
        log.info("Recebendo requisição para previsão com IA. Tipo: {}, Horizonte: {}", type, horizon);
        
        ForecastResponse forecast = llmForecastService.getForecast(type, horizon);
        
        return ResponseEntity.ok(forecast);
    }
}
