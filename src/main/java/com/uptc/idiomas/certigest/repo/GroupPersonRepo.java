package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.GroupInst;
import com.uptc.idiomas.certigest.entity.GroupPerson;
import com.uptc.idiomas.certigest.entity.GroupPersonId;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupPersonRepo extends JpaRepository<GroupPerson, GroupPersonId> {
    @Query("SELECT DISTINCT gp.group_id FROM GroupPerson gp WHERE :currentDate BETWEEN gp.start_date AND gp.end_date")
    List<GroupInst> findActiveGroupInstsByDate(@Param("currentDate") Date currentDate);
}
