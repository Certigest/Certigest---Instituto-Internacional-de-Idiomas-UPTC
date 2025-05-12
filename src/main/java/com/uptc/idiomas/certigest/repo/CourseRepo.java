package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.Course;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface CourseRepo extends JpaRepository<Course, Integer> {
    @Query("SELECT c FROM Course c WHERE c.course_name = :courseName")
    Optional<Course> findByCourse_name(@Param("courseName") String courseName);
}
