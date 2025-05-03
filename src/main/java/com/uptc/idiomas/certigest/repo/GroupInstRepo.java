package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.GroupInst;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupInstRepo extends JpaRepository<GroupInst, Integer> {
}
