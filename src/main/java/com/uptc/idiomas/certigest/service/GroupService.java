package com.uptc.idiomas.certigest.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.uptc.idiomas.certigest.dto.GroupInstDTO;
import com.uptc.idiomas.certigest.dto.PersonDTO;
import com.uptc.idiomas.certigest.dto.PersonDTONote;
import com.uptc.idiomas.certigest.entity.GroupInst;
import com.uptc.idiomas.certigest.entity.GroupPerson;
import com.uptc.idiomas.certigest.entity.GroupPersonId;
import com.uptc.idiomas.certigest.entity.Person;
import com.uptc.idiomas.certigest.mapper.GroupInstMapper;
import com.uptc.idiomas.certigest.mapper.PersonMapper;
import com.uptc.idiomas.certigest.repo.GroupInstRepo;
import com.uptc.idiomas.certigest.repo.GroupPersonRepo;

import jakarta.persistence.EntityNotFoundException;

@Service
public class GroupService extends BasicServiceImpl<GroupInstDTO, GroupInst, Integer> {

    @Autowired
    private PersonService personService;
    @Autowired
    private GroupPersonService groupPersonService;
    @Autowired
    private GroupInstRepo groupRepo;
    @Autowired
    private GroupPersonRepo groupPersonRepo;

    private final GroupInstMapper mapper = GroupInstMapper.INSTANCE;

    @Override
    protected JpaRepository<GroupInst, Integer> getRepo() {
        return groupRepo;
    }

    @Override
    protected GroupInst toEntity(GroupInstDTO dto) {
        return mapper.mapGroupInstDTOToGroupInst(dto);
    }

    @Override
    protected GroupInstDTO toDTO(GroupInst entity) {
        return mapper.mapGroupInstToGroupInstDTO(entity);
    }

    @Override
    public void deleteById(Integer id) {
        GroupInst group = groupRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Grupo no encontrado"));

        if (group.getEnd_date() != null) {
            LocalDate endDate = group.getEnd_date().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
            LocalDate today = LocalDate.now();

            if (endDate.isAfter(today)) {
                group.setState(false);
                groupRepo.save(group);
            } else {
                groupPersonService.deleteAllByGroupId(id);
                groupRepo.deleteById(id);
            }
        } else {
            group.setState(false);
            groupRepo.save(group);
        }
    }

    public List<GroupInstDTO> findByLevelId(Integer levelId) {
        return groupRepo.findByLevelId(levelId)
                .stream()
                .map(mapper::mapGroupInstToGroupInstDTO)
                .collect(Collectors.toList());
    }

    public List<GroupInstDTO> getGroupsByTeacher(String username) {
        Person teacher = personService.getPersonByUserName(username);
        List<GroupInstDTO> groupTeacherList = new ArrayList<>();
        List<GroupInst> groups = getGroupActiveByDateRange();
        if (groups != null && !groups.isEmpty()) {
            for (GroupInst group : groups) {
                if (teacher.getDocument().equals(group.getGroup_teacher().getDocument())) {
                    groupTeacherList.add(GroupInstMapper.INSTANCE.mapGroupInstToGroupInstDTO(group));
                }
            }
        }
        return groupTeacherList;
    }

    public List<PersonDTO> getPersonsByGroupIdAndActiveDate(Integer groupId) {
        List<Person> persons = groupPersonRepo.findPersonsByGroupIdAndActiveDate(groupId, new Date());
        List<PersonDTO> personDTOs = new ArrayList<>();
        for (Person person : persons) {
            personDTOs.add(PersonMapper.INSTANCE.mapPersonToPersonDTO(person));
        }
        return personDTOs;
    }

    public List<GroupInst> getGroupActiveByDateRange() {
        List<GroupInst> groupPerson = groupPersonRepo.findActiveGroupInstsByDate(new Date());
        return groupPerson;
    }

    public void updateCalification(Integer personId, Integer groupId, Float newCalification) {
        GroupPersonId id = new GroupPersonId(personId, groupId);
        GroupPerson gp = groupPersonRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("GroupPerson no encontrado"));
        gp.setCalification(newCalification);
        gp.setCalificationDate(new Date());
        groupPersonRepo.save(gp);
    }

    public void qualifyGroup(List<PersonDTONote> students, Integer groupId) {
        for (PersonDTONote student : students) {
            Person p = personService.getPersonByDocument(student.getDocument());
            updateCalification(p.getPersonId(), groupId, student.getCalification());
        }
    }
}
