package com.uptc.idiomas.certigest.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.uptc.idiomas.certigest.entity.Login;

public interface LoginRepo extends JpaRepository<Login, Integer>{
    boolean existsByUserName(String userName);
    Optional<Login> findByUserName(String userName);
}
