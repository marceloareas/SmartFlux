package com.smartflux.api.service;

import java.util.List;
import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;
import com.smartflux.api.config.JWTUserData;

import org.springframework.stereotype.Service;

import com.smartflux.api.model.Category;
import com.smartflux.api.model.User;
import com.smartflux.api.repository.CategoryRepository;
import com.smartflux.api.service.exceptionsCustom.ResourceNotFoundException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    private UUID getCurrentUserId() {
        JWTUserData userData = (JWTUserData) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(userData.userId());
    }

    public List<Category> findAllCategory() {
        return categoryRepository.findByUserId(getCurrentUserId());
    }

    public Category findCategoryById(UUID id) {
        return categoryRepository.findByIdAndUserId(id, getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }

    @Transactional
    public Category insertCategory(Category category) {
        category.setId(null);
        User currentUser = new User();
        currentUser.setId(getCurrentUserId());
        category.setUser(currentUser);
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        findCategoryById(id);
        categoryRepository.deleteById(id);
    }

    @Transactional
    public Category updateCategory(UUID id, Category categoryDetails) {
        Category category = findCategoryById(id);

        category.setName(categoryDetails.getName());
        category.setColor(categoryDetails.getColor());
        category.setActive(categoryDetails.getActive());

        return categoryRepository.save(category);
    }
}
