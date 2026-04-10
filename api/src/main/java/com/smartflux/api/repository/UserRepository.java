package com.smartflux.api.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.security.core.userdetails.UserDetails;

import com.smartflux.api.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<UserDetails> findUserByEmail(String username);
}
