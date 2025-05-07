package com.uptc.idiomas.certigest.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.uptc.idiomas.certigest.entity.Role;

import java.util.Optional;

@Repository
public interface RoleRepo extends JpaRepository<Role, Long> {
    
    Optional<Role> findByName(Role.RoleName name);
    
    // Si deseas buscar por el nombre como String (no enum), podrías agregar:
    // Optional<Role> findByName(String name);
}
