package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LevelRepo extends JpaRepository<Level, Integer> {

}
