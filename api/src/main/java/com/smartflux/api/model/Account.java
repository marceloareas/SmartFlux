package com.smartflux.api.model;

import java.time.LocalDateTime;
import java.util.UUID;

import com.smartflux.api.model.enums.Currency;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import lombok.ToString;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
@Entity
@Table(name = "accounts", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "name"})
})
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = true)
    private String color;

    @Column(nullable = false, length = 4)
    @Enumerated(EnumType.STRING)
    private Currency currency = Currency.BRL;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Account(User user, String name, String color, Currency currency) {
        this.user = user;
        this.name = name;
        this.color = color;
        this.currency = currency;
    }

}
