package com.smartflux.api.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.smartflux.api.model.User;
import com.smartflux.api.repository.UserRepository;
import com.smartflux.api.service.exceptionsCustom.ResourceNotFoundException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> findAllUser() {
        List<User> users = userRepository.findAll();
        return users;
    }

    public User findUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        return user;
    }

    // POST ------------------------------------------------------------------
    public User insertUser(User user) {
        User newUser = new User();
        newUser.setName(user.getName());
        newUser.setEmail(user.getEmail());
        newUser.setPasswordHash(user.getPasswordHash());
        newUser.setTimezone(user.getTimezone());
        return userRepository.save(newUser);
    }

    // DELETE ------------------------------------------------------------------
    public void deleteUser(UUID id) {
        findUserById(id);
        userRepository.deleteById(id);
    }

    // PUT ------------------------------------------------------------------
    @Transactional
    public User updateUser(UUID id, User user) {
        User newUser = findUserById(id);

        newUser.setName(user.getName());
        newUser.setEmail(user.getEmail());
        newUser.setPasswordHash(user.getPasswordHash());
        newUser.setTimezone(user.getTimezone());
        newUser.setUpdatedAt(LocalDateTime.now()); // Incluir no próximo commit

        return newUser;
    }
}
