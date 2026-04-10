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
    private final AccountService accountService;

    public List<User> findAllUser() {
        List<User> users = userRepository.findAll();
        return users;
    }

    public User findUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        return user;
    }

    public User findUserByEmail(String email) {
        User user = (User) userRepository.findUserByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return user;
    }

    // POST ------------------------------------------------------------------
    @Transactional
    public User insertUser(User newUser) {

        User userSaved = userRepository.save(newUser);//Salva o usuario no banco (gera um id)

        accountService.createDefaultAccount(userSaved);//Pega o id criado e cria a conta padrão

        return userSaved;
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
        newUser.setUpdatedAt(LocalDateTime.now());

        return newUser;
    }

}
