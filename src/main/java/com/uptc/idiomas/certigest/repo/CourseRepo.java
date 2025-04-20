package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.Course;
import com.uptc.idiomas.certigest.entity.Course.CourseType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepo extends JpaRepository<Course, Integer> {
}
