package com.smartflux.api.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartflux.api.model.User;
import com.smartflux.api.service.AccountService;
import com.smartflux.api.service.UserService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Endpoints para gestão de usuários")
public class UserController {

    private final UserService userService;
    private final AccountService accountService;

    // GET ------------------------------------------------------------------
    @GetMapping
    public ResponseEntity<List<User>> findAllUser() {
        List<User> users = userService.findAllUser();
        return ResponseEntity.ok().body(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> findUserById(@PathVariable UUID id) {
        User user = userService.findUserById(id);
        return ResponseEntity.ok().body(user);
    }

    // POST ------------------------------------------------------------------
    @PostMapping
    public ResponseEntity<User> insertUser(@RequestBody User user) {
        User newUser = userService.insertUser(user);
        accountService.createDefaultAccount(newUser);
        return ResponseEntity.ok().body(newUser);
    }

    // DELETE ------------------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // PUT ------------------------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable UUID id, @RequestBody User user) {
        User user2 = userService.updateUser(id, user);
        return ResponseEntity.ok().body(user2);
    }
    
}
