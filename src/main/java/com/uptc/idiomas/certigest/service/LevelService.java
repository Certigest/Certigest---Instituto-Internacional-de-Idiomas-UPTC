package com.uptc.idiomas.certigest.service;

import java.util.List;
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

@Service
public class LevelService extends BasicServiceImpl<LevelDTO, Level, Integer> {

    @Autowired
    private LevelRepo levelRepo;
    @Autowired
    private GroupService groupService;

    private final LevelMapper mapper = LevelMapper.INSTANCE;

    @Override
    protected JpaRepository<Level, Integer> getRepo() {
        return levelRepo;
    }

    @Override
    protected Level toEntity(LevelDTO dto) {
        return mapper.mapLevelDTOToLevel(dto);
    }

    @Override
    protected LevelDTO toDTO(Level entity) {
        return mapper.mapLevelToLevelDTO(entity);
    }

    @Override
    public void deleteById(Integer id) {
        Level level = levelRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Nivel no encontrado"));

        List<GroupInstDTO> groups = groupService.findByLevelId(id);
        for (GroupInstDTO group : groups) {
            groupService.deleteById(group.getGroup_id());
        }

        level.setState(false);
        levelRepo.save(level);
    }

    public List<LevelDTO> findByCourseId(Integer id_course) {
        return levelRepo.findByCourseId(id_course)
                .stream()
                .map(mapper::mapLevelToLevelDTO)
                .collect(Collectors.toList());
    }

}