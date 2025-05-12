package com.uptc.idiomas.certigest.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.uptc.idiomas.certigest.dto.GroupInstDTO;
import com.uptc.idiomas.certigest.dto.LevelDTO;
import com.uptc.idiomas.certigest.entity.Level;
import com.uptc.idiomas.certigest.mapper.LevelMapper;
import com.uptc.idiomas.certigest.repo.LevelRepo;

import jakarta.persistence.EntityNotFoundException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class LevelServiceTest {

    @InjectMocks
    private LevelService levelService;

    @Mock
    private LevelRepo levelRepo;

    @Mock
    private GroupService groupService;

    private final LevelMapper mapper = LevelMapper.INSTANCE;

    private Level level;
    private LevelDTO levelDTO;

    @BeforeEach
    void setUp() {
        level = new Level();
        level.setLevel_id(1);
        level.setLevel_name("Test Level");
        level.setLevel_description("Test Desc");
        level.setState(true);

        levelDTO = mapper.mapLevelToLevelDTO(level);
    }

    @Test
    void testGetRepo() {
        assertEquals(levelRepo, levelService.getRepo());
    }

    @Test
    void testToDTO() {
        LevelDTO dto = levelService.toDTO(level);
        assertEquals("Test Level", dto.getLevel_name());
        assertEquals("Test Desc", dto.getLevel_description());
    }

    @Test
    void testToEntity() {
        Level entity = levelService.toEntity(levelDTO);
        assertEquals("Test Level", entity.getLevel_name());
        assertEquals("Test Desc", entity.getLevel_description());
    }

    @Test
    void testDeleteById_Success() {
        when(levelRepo.findById(1)).thenReturn(Optional.of(level));

        GroupInstDTO g1 = new GroupInstDTO();
        g1.setGroup_id(10);
        GroupInstDTO g2 = new GroupInstDTO();
        g2.setGroup_id(20);
        when(groupService.findByLevelId(1)).thenReturn(Arrays.asList(g1, g2));

        levelService.deleteById(1);

        assertFalse(level.getState());
        verify(groupService).deleteById(10);
        verify(groupService).deleteById(20);
        verify(levelRepo).save(level);
    }

    @Test
    void testDeleteById_NotFound() {
        when(levelRepo.findById(99)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> levelService.deleteById(99));
        verify(levelRepo, never()).save(any());
    }

    @Test
    void testFindByCourseId() {
        Level l1 = new Level();
        l1.setLevel_id(1);
        l1.setLevel_name("L1");
        Level l2 = new Level();
        l2.setLevel_id(2);
        l2.setLevel_name("L2");
        when(levelRepo.findByCourseId(5)).thenReturn(Arrays.asList(l1, l2));

        List<LevelDTO> levels = levelService.findByCourseId(5);

        assertEquals(2, levels.size());
        assertEquals("L1", levels.get(0).getLevel_name());
        assertEquals("L2", levels.get(1).getLevel_name());
    }
}
