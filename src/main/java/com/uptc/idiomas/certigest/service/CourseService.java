package com.uptc.idiomas.certigest.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.uptc.idiomas.certigest.dto.CourseDTO;
import com.uptc.idiomas.certigest.dto.LevelDTO;
import com.uptc.idiomas.certigest.entity.Course;
import com.uptc.idiomas.certigest.mapper.CourseMapper;
import com.uptc.idiomas.certigest.repo.CourseRepo;

import jakarta.persistence.EntityNotFoundException;

/**
 * Servicio encargado de manejar la lógica de negocio relacionada con los cursos.
 * Extiende de {@link BasicServiceImpl} para proveer operaciones CRUD genéricas.
 */
@Service
public class CourseService extends BasicServiceImpl<CourseDTO, Course, Integer> {

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private LevelService levelService;

    private final CourseMapper mapper = CourseMapper.INSTANCE;

    /**
     * Devuelve el repositorio específico usado para operaciones CRUD.
     *
     * @return el repositorio de cursos.
     */
    @Override
    protected JpaRepository<Course, Integer> getRepo() {
        return courseRepo;
    }

    /**
     * Convierte un DTO de curso a una entidad {@link Course}.
     *
     * @param dto el DTO del curso.
     * @return la entidad {@link Course} correspondiente.
     */
    @Override
    protected Course toEntity(CourseDTO dto) {
        return mapper.mapCourseDTOToCourse(dto);
    }

    /**
     * Convierte una entidad {@link Course} a su DTO correspondiente.
     *
     * @param entity la entidad del curso.
     * @return el DTO {@link CourseDTO}.
     */
    @Override
    protected CourseDTO toDTO(Course entity) {
        return mapper.mapCourseToCourseDTO(entity);
    }

    /**
     * Elimina un curso de manera lógica, desactivando su estado.
     * También elimina todos los niveles asociados al curso.
     *
     * @param id el identificador del curso a eliminar.
     * @throws EntityNotFoundException si el curso no existe.
     */
    @Override
    public void deleteById(Integer id) {
        Course course = courseRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Curso no encontrado"));

        List<LevelDTO> levels = levelService.findByCourseId(id);
        for (LevelDTO level : levels) {
            levelService.deleteById(level.getLevel_id());
        }

        course.setState(false);
        courseRepo.save(course);
    }

    public List<CourseDTO> getAllActiveCourses() {
        return courseRepo.getAllActiveCourse().stream().map(mapper::mapCourseToCourseDTO)
        .collect(Collectors.toList());
    }
}
