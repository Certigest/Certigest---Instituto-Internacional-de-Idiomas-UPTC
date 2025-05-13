package com.uptc.idiomas.certigest.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.uptc.idiomas.certigest.dto.GroupInstDTO;
import com.uptc.idiomas.certigest.dto.LevelDTO;
import com.uptc.idiomas.certigest.entity.Level;
import com.uptc.idiomas.certigest.mapper.LevelMapper;
import com.uptc.idiomas.certigest.repo.LevelRepo;

import jakarta.persistence.EntityNotFoundException;

/**
 * Servicio que gestiona operaciones relacionadas con los niveles (Level) en el sistema.
 * Extiende la funcionalidad genérica de {@link BasicServiceImpl}.
 */
@Service
public class LevelService extends BasicServiceImpl<LevelDTO, Level, Integer> {

    @Autowired
    private LevelRepo levelRepo;

    @Autowired
    private GroupService groupService;

    private final LevelMapper mapper = LevelMapper.INSTANCE;

    /**
     * {@inheritDoc}
     */
    @Override
    protected JpaRepository<Level, Integer> getRepo() {
        return levelRepo;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected Level toEntity(LevelDTO dto) {
        return mapper.mapLevelDTOToLevel(dto);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected LevelDTO toDTO(Level entity) {
        return mapper.mapLevelToLevelDTO(entity);
    }

    /**
     * Elimina lógicamente un nivel y todos los grupos asociados marcándolos como inactivos.
     *
     * @param id ID del nivel a eliminar.
     * @throws EntityNotFoundException si el nivel no existe.
     */
    @Override
    public void deleteById(Integer id) {
        Level level = levelRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Nivel no encontrado"));

        List<GroupInstDTO> groups = groupService.findByLevelId(id);
        for (GroupInstDTO group : groups) {
            groupService.deleteById(group.getGroup_id());
        }

        level.setState(false);
        levelRepo.save(level);
    }

    /**
     * Obtiene todos los niveles asociados a un curso específico.
     *
     * @param id_course ID del curso.
     * @return Lista de {@link LevelDTO}.
     */
    public List<LevelDTO> findByCourseId(Integer id_course) {
        return levelRepo.findByCourseId(id_course)
                .stream()
                .map(mapper::mapLevelToLevelDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca un nivel por su ID.
     *
     * @param levelId ID del nivel.
     * @return Entidad {@link Level}.
     * @throws EntityNotFoundException si el nivel no existe.
     */
    public Level findByLevelId(Integer levelId) {
        Optional<Level> levelOpt = levelRepo.findById(levelId);
        if (levelOpt.isPresent())
            return levelOpt.get();
        else
            throw new EntityNotFoundException("Nivel no encontrado con ID: " + levelId);
    }

    /**
     * Busca un nivel por su nombre y el ID del curso al que pertenece.
     *
     * @param level_name Nombre del nivel.
     * @param course_id  ID del curso.
     * @return {@link Optional} con la entidad {@link Level} si existe.
     */
    public Optional<Level> findByLevelNameAndCourseName(String level_name, Integer course_id) {
        return levelRepo.findByLevelNameAndCourseId(level_name, course_id);
    }
}
