package com.smartflux.api.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartflux.api.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    
}
