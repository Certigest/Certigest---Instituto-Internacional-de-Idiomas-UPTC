package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.GroupPerson;
import com.uptc.idiomas.certigest.entity.GroupPersonId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupPersonRepo extends JpaRepository<GroupPerson, GroupPersonId> {

}
