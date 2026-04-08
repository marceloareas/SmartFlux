package com.smartflux.api.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.smartflux.api.model.Category;
import com.smartflux.api.repository.CategoryRepository;
import com.smartflux.api.service.exceptionsCustom.ResourceNotFoundException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> findAllCategory() {
        return categoryRepository.findAll();
    }

    public Category findCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }

    @Transactional
    public Category insertCategory(Category category) {
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
