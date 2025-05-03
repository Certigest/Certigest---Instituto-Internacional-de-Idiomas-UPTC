package com.uptc.idiomas.certigest.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uptc.idiomas.certigest.dto.GroupInstDTO;
import com.uptc.idiomas.certigest.entity.GroupInst;
import com.uptc.idiomas.certigest.entity.GroupPerson;
import com.uptc.idiomas.certigest.entity.Person;
import com.uptc.idiomas.certigest.mapper.GroupInstMapper;
import com.uptc.idiomas.certigest.repo.GroupInstRepo;
import com.uptc.idiomas.certigest.repo.GroupPersonRepo;

@Service
public class GroupService {

    @Autowired
    private PersonService personService;
    @Autowired
    private GroupInstRepo groupRepo;
    @Autowired
    private GroupPersonRepo groupPersonRepo;

    public List<GroupInstDTO> getGroupsByTeacher(String username){
        Person teacher = personService.getPersonByUserName(username);
        List<GroupInstDTO> groupTeacherList = new ArrayList<>();
        List<GroupInst> groups = getGroupActiveByDateRange();
        if (groups != null && !groups.isEmpty()) {
            for (GroupInst group : groups) {
                if(teacher.getDocument().equals(group.getGroup_teacher().getDocument())){ 
                    groupTeacherList.add(GroupInstMapper.INSTANCE.mapGroupInstToGroupInstDTO(group));
                }
            }
        }
        return groupTeacherList;
    }

    public List<GroupInst> getGroupActiveByDateRange() {
        List<GroupInst> groupPerson = groupPersonRepo.findActiveGroupInstsByDate(new Date());
        return groupPerson;
    }
}
