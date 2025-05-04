package com.uptc.idiomas.certigest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.uptc.idiomas.certigest.dto.LevelDTO;
import com.uptc.idiomas.certigest.entity.Level;
import com.uptc.idiomas.certigest.mapper.LevelMapper;
import com.uptc.idiomas.certigest.repo.LevelRepo;

@Service
public class LevelService extends BasicServiceImpl<LevelDTO, Level, Integer> {

    @Autowired
    private LevelRepo levelRepo;

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

}