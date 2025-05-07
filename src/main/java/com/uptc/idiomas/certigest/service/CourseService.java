package com.uptc.idiomas.certigest.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.uptc.idiomas.certigest.dto.CourseDTO;
import com.uptc.idiomas.certigest.dto.GroupInstDTO;
import com.uptc.idiomas.certigest.dto.LevelDTO;
import com.uptc.idiomas.certigest.entity.Course;
import com.uptc.idiomas.certigest.entity.Level;
import com.uptc.idiomas.certigest.mapper.CourseMapper;
import com.uptc.idiomas.certigest.repo.CourseRepo;

import jakarta.persistence.EntityNotFoundException;

@Service
public class CourseService extends BasicServiceImpl<CourseDTO, Course, Integer> {

    @Autowired
    private CourseRepo courseRepo;
    @Autowired
    private LevelService levelService;

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

    @Override
    public void deleteById(Integer id) {
        Course course = courseRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Curso no encontrado"));

        List<LevelDTO> levels = levelService.findByCourseId(id);
        for (LevelDTO level : levels) {
            levelService.deleteById(level.getLevel_id());
        }

        course.setState(false);
        courseRepo.save(course);
    }
}
