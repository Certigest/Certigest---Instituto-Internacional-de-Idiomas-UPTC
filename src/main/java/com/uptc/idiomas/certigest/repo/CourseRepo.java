package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface CourseRepo extends JpaRepository<Course, Integer> {
}
