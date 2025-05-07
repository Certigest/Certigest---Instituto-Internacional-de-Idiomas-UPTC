package com.uptc.idiomas.certigest.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uptc.idiomas.certigest.entity.Login;
import com.uptc.idiomas.certigest.entity.Person;

public interface LoginRepo extends JpaRepository<Login, Integer> {
    boolean existsByUserName(String userName);
    Optional<Login> findByUserName(String userName);

    Optional<Login> findByPerson(Person person); // Para obtener el login por persona
    boolean existsByPerson(Person person);       // Para validar si existe login asociado
    void deleteByPerson(Person person);          // Para eliminar login por persona
}
