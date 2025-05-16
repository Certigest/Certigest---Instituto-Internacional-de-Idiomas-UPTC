package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.Level;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LevelRepo extends JpaRepository<Level, Integer> {
    @Query("SELECT l FROM Level l WHERE l.id_course.id_course = :idCourse")
    List<Level> findByCourseId(@Param("idCourse") Integer idCourse);
    @Query("SELECT l FROM Level l WHERE l.level_name = :levelName AND l.id_course.id_course = :courseId")
    Optional<Level> findByLevelNameAndCourseId(@Param("levelName") String levelName, @Param("courseId") Integer courseId);
    @Query("SELECT COUNT(gp) FROM GroupPerson gp JOIN gp.group_id g JOIN g.level_id l WHERE gp.person_id.personId = :personId AND l.level_id = :levelId")
    long countByPersonIdAndLevelId(@Param("personId") Integer personId, @Param("levelId") Integer levelId);

    @Query("""
        SELECT COUNT(DISTINCT gp.person_id.personId)
        FROM GroupPerson gp
        JOIN gp.group_id gi
        WHERE gi.level_id.level_id = :levelId
          AND CURRENT_DATE BETWEEN gp.start_date AND gp.end_date
          AND gp.person_id.personId IN (
              SELECT pr.person.personId FROM PersonRole pr
              JOIN pr.role r
              WHERE r.name = 'STUDENT'
          )
    """)
    Long countActiveStudentsByLevel(@Param("levelId") Integer levelId);


    @Query("SELECT l FROM Level l WHERE l.id_course.id_course = :courseId AND l.state = true")
    List<Level> findActiveLevelsByCourseId(@Param("courseId") Integer courseId);
}
