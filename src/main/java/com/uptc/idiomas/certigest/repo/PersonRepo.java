package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.Person;
import com.uptc.idiomas.certigest.entity.Person.Role;
import com.uptc.idiomas.certigest.entity.Person.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonRepo extends JpaRepository<Person, Integer> {

    // Buscar personas por rol (estudiante, profesor, administrador)
    List<Person> findByRole(Role role);

    // Buscar personas por tipo de documento (CC, TI)
    List<Person> findByDocumentType(DocumentType documentType);

    // Buscar personas por ubicación
    List<Person> findByLocation_IdLocation(Integer locationId);

    // Buscar personas por nombre
    List<Person> findByFirstNameContainingIgnoreCase(String firstName);

    // Buscar personas por apellido
    List<Person> findByLastNameContainingIgnoreCase(String lastName);

    // Buscar personas por estado
    List<Person> findByStatus(Boolean status);
}
