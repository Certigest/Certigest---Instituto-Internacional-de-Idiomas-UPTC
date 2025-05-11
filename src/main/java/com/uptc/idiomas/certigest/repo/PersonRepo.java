package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.Person;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonRepo extends JpaRepository<Person, Integer> {

    Optional<Person> findByEmail(String email);
    Optional<Person> findByDocument(String document);
    boolean existsByDocument(String document);
    boolean existsByEmail(String email);
    @Query("""
    SELECT p FROM Person p
    JOIN PersonRole pr ON pr.person.id = p.id
    JOIN Role r ON pr.role.id = r.id
    LEFT JOIN GroupPerson gp ON gp.person_id = p AND gp.group_id.level_id.id = :levelId
    WHERE r.name = 'STUDENT' AND p.status = true AND (gp.person_id IS NULL OR gp.calification < 30)
    """)
    List<Person> findStudentsWhoHaveNotTakenLevelOrFailed(@Param("levelId") Integer levelId);

    
}
