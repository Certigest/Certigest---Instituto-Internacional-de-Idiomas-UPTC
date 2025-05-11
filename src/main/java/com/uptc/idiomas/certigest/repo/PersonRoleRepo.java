package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.PersonRole;
import com.uptc.idiomas.certigest.entity.PersonRoleId;
import com.uptc.idiomas.certigest.entity.Role.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonRoleRepo extends JpaRepository<PersonRole, PersonRoleId> {

    // Obtener por nombre del rol
    @Query("SELECT pr FROM personRole pr WHERE pr.role.name = :roleName")
    List<PersonRole> findByRoleName(RoleName roleName);

    // Obtener todos los PersonRole de una persona
    @Query("SELECT pr FROM personRole pr WHERE pr.person.id = :personId")
    List<PersonRole> findByPersonId(Integer personId);

    // Solo los nombres de roles de una persona
    @Query("SELECT pr.role.name FROM personRole pr WHERE pr.person.id = :personId")
    List<RoleName> findRoleNamesByPersonId(Long personId);

    @Modifying
    @Query("DELETE FROM personRole pr WHERE pr.person.personId = :personId")
    void deleteByPersonId(@Param("personId") int personId);
}
