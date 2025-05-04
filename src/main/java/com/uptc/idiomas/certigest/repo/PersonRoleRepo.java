package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.PersonRole;
import com.uptc.idiomas.certigest.entity.PersonRoleId;
import com.uptc.idiomas.certigest.entity.Role.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonRoleRepo extends JpaRepository<PersonRole, PersonRoleId> {
    @Query("SELECT pr FROM PersonRole pr WHERE pr.role.name = :roleName")
    List<PersonRole> findByRoleName(RoleName roleName);
}