package com.uptc.idiomas.certigest.repo;

import com.uptc.idiomas.certigest.entity.GroupInst;
import com.uptc.idiomas.certigest.entity.GroupPerson;
import com.uptc.idiomas.certigest.entity.GroupPersonId;
import com.uptc.idiomas.certigest.entity.Person;

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

    @Query("SELECT gp.person_id FROM GroupPerson gp WHERE gp.group_id.group_id = :groupId AND :currentDate BETWEEN gp.start_date AND gp.end_date")
    List<Person> findPersonsByGroupIdAndActiveDate(@Param("groupId") Integer groupId, @Param("currentDate") Date currentDate);
}
