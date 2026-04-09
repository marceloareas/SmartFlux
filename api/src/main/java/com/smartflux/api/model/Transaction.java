package com.smartflux.api.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.NumericBooleanConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.PositiveOrZero;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = true)
    private Category category;

    @Column(nullable = false, name = "direction")
    @Convert(converter = NumericBooleanConverter.class)
    private Boolean direction; // CREDIT = true = 1, DEBIT = false = 0

    @Column(nullable = false)
    @PositiveOrZero
    private BigDecimal amount;

    @Column(nullable = true)
    private String description;

    @Column(nullable = false, name = "competence_date")
    private LocalDateTime competenceDate = LocalDateTime.now();

    @Column(nullable = true, name = "due_date")
    private LocalDateTime dueDate; // TODO: verificar se status=PENDING

    @Column(nullable = false)
    private int status; // PENDING=0 | COMPLETED=1 | CANCELED=2

    @Column(nullable = false, name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(nullable = false, name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Transaction(Account account, Category category, Boolean direction, BigDecimal amount, String description,
            LocalDateTime competenceDate, LocalDateTime dueDate, int status) {
        this.account = account;
        this.category = category;
        this.direction = direction;
        this.amount = amount;
        this.description = description;
        this.competenceDate = competenceDate;
        this.dueDate = dueDate;
        this.status = status;
    }
}
