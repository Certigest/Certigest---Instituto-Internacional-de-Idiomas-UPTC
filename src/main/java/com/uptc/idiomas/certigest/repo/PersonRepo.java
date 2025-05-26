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
        WHERE r.name = 'STUDENT' 
          AND p.status = true 
          AND (
            NOT EXISTS (
              SELECT gp FROM GroupPerson gp
              WHERE gp.person_id = p
                AND gp.group_id.level_id.level_id = :levelId
            )
            OR (
              EXISTS (
                SELECT gp FROM GroupPerson gp
                WHERE gp.person_id = p
                  AND gp.group_id.level_id.level_id = :levelId
                  AND gp.calification < 3.0
                  AND gp.end_date < CURRENT_DATE
              )
            )
          )
          AND NOT EXISTS (
            SELECT gp FROM GroupPerson gp
            WHERE gp.person_id = p
              AND gp.group_id.level_id.level_id = :levelId
              AND gp.end_date >= CURRENT_DATE
          )
    """)

    List<Person> findStudentsWhoHaveNotTakenLevelOrFailed(@Param("levelId") Integer levelId);


}
