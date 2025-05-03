package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepo extends JpaRepository<Location, Integer> {
}
