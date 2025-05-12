package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.GroupInst;
import com.uptc.idiomas.certigest.entity.Person;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupInstRepo extends JpaRepository<GroupInst, Integer> {
    @Query("SELECT g FROM GroupInst g WHERE g.level_id.level_id = :levelId")
    List<GroupInst> findByLevelId(@Param("levelId") Integer levelId);

    @Query("SELECT g FROM GroupInst g WHERE g.level_id.level_id = :levelId AND g.state = true")
    List<GroupInst> findActiveByLevelId(@Param("levelId") Integer levelId);

    @Query("SELECT g FROM GroupInst g WHERE g.state = true")
    List<GroupInst> findAllActiveGroups();

    @Query("SELECT g FROM GroupInst g WHERE g.group_name = :groupName AND g.level_id.level_id = :levelId AND g.level_id.id_course.id_course = :courseId")
    Optional<GroupInst> findByCourseIdAndLevelIdAndGroupName(@Param("courseId") Integer courseId, @Param("levelId") Integer levelId, @Param("groupName") String groupName);
}
