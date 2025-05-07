package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.Level;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LevelRepo extends JpaRepository<Level, Integer> {
    @Query("SELECT l FROM Level l WHERE l.id_course.id_course = :idCourse")
    List<Level> findByCourseId(@Param("idCourse") Integer idCourse);
}
