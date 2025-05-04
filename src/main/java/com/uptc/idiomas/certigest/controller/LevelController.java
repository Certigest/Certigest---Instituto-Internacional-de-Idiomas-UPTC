package com.uptc.idiomas.certigest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.uptc.idiomas.certigest.dto.LevelDTO;
import com.uptc.idiomas.certigest.service.LevelService;

@RestController
@RequestMapping("/level")
public class LevelController {

    @Autowired
    private LevelService levelService;

    @PostMapping("/createLevel")
    public ResponseEntity<LevelDTO> createLevel(@RequestBody LevelDTO levelDTO) {
        LevelDTO created = levelService.create(levelDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LevelDTO> getLevelById(@PathVariable Integer id) {
        LevelDTO level = levelService.findById(id);
        return level != null ? ResponseEntity.ok(level) : ResponseEntity.notFound().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<LevelDTO>> getAllLevels() {
        return ResponseEntity.ok(levelService.findAll());
    }

    @PutMapping
    public ResponseEntity<LevelDTO> updateLevel(@RequestBody LevelDTO levelDTO) {
        LevelDTO updated = levelService.update(levelDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLevel(@PathVariable Integer id) {
        levelService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
