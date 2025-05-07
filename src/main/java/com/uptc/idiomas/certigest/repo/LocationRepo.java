package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.Location;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepo extends JpaRepository<Location, Integer> {
    List<Location> findByParentIdLocation(Integer parentId);
}
