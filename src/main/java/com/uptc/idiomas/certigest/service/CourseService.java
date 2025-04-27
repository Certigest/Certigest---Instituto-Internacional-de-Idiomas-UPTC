package com.uptc.idiomas.certigest.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.uptc.idiomas.certigest.dto.CourseDTO;
import com.uptc.idiomas.certigest.entity.Course;
import com.uptc.idiomas.certigest.mapper.CourseMapper;
import com.uptc.idiomas.certigest.repo.CourseRepo;

@Service
public class CourseService extends BasicServiceImpl<Course, Integer> {

    @Autowired
    private CourseRepo courseRepo;

    @Override
    protected JpaRepository<Course, Integer> getRepo() {
        return courseRepo;
    }

    public CourseDTO addCourseInDb(CourseDTO courseDTO) {
        Course course = CourseMapper.INSTANCE.mapCourseDTOToCourse(courseDTO);

        Course courseSaved = courseRepo.save(course);

        return CourseMapper.INSTANCE.mapCourseToCourseDTO(courseSaved);
    }

    public List<CourseDTO> getAllCourses() {
        List<Course> courses = courseRepo.findAll();
        return courses.stream()
                .map(CourseMapper.INSTANCE::mapCourseToCourseDTO)
                .collect(Collectors.toList());
    }

}
