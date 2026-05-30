package com.smartflux.api.config;

import net.datafaker.Faker;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Locale;

@Configuration
public class FakerConfig {

    @SuppressWarnings("deprecation")
    @Bean
    public Faker faker() {
        return new Faker(new Locale("pt", "BR"));
    }
}
