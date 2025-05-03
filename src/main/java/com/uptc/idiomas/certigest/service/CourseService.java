package com.uptc.idiomas.certigest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.uptc.idiomas.certigest.dto.CourseDTO;
import com.uptc.idiomas.certigest.entity.Course;
import com.uptc.idiomas.certigest.mapper.CourseMapper;
import com.uptc.idiomas.certigest.repo.CourseRepo;

@Service
public class CourseService extends BasicServiceImpl<CourseDTO, Course, Integer> {

    @Autowired
    private CourseRepo courseRepo;

    private final CourseMapper mapper = CourseMapper.INSTANCE;

    @Override
    protected JpaRepository<Course, Integer> getRepo() {
        return courseRepo;
    }

    @Override
    protected Course toEntity(CourseDTO dto) {
        return mapper.mapCourseDTOToCourse(dto);
    }

    @Override
    protected CourseDTO toDTO(Course entity) {
        return mapper.mapCourseToCourseDTO(entity);
    }
}
