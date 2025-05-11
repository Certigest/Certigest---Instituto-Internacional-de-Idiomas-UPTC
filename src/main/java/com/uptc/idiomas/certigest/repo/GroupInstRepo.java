package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.GroupInst;
import com.uptc.idiomas.certigest.entity.Person;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupInstRepo extends JpaRepository<GroupInst, Integer> {
    @Query("SELECT g FROM groupInst g WHERE g.level_id.level_id = :levelId")
    List<GroupInst> findByLevelId(@Param("levelId") Integer levelId);
}
