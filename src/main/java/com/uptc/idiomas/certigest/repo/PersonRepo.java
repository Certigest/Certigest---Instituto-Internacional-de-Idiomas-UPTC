package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.Person;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonRepo extends JpaRepository<Person, Integer> {

    Optional<Person> findByEmail(String email);
    Optional<Person> findByDocument(String document);
}
