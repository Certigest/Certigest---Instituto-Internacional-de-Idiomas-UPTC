package com.uptc.idiomas.certigest.service;

import java.time.LocalDate;
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
import com.uptc.idiomas.certigest.entity.GroupPerson.LevelModality;
import com.uptc.idiomas.certigest.entity.GroupPersonId;
import com.uptc.idiomas.certigest.entity.Person;
import com.uptc.idiomas.certigest.mapper.GroupInstMapper;
import com.uptc.idiomas.certigest.mapper.PersonMapper;
import com.uptc.idiomas.certigest.repo.GroupInstRepo;
import com.uptc.idiomas.certigest.repo.GroupPersonRepo;
import com.uptc.idiomas.certigest.repo.PersonRepo;

import jakarta.persistence.EntityNotFoundException;

@Service
public class GroupService extends BasicServiceImpl<GroupInstDTO, GroupInst, Integer> {

    @Autowired
    private PersonService personService;
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

    public void removeStudentFromGroup(Integer personId, Integer groupId) {
        GroupPersonId id = new GroupPersonId(personId, groupId);
        if (!groupPersonRepo.existsById(id)) {
            throw new EntityNotFoundException("El estudiante no está inscrito en este grupo.");
        }
        groupPersonRepo.deleteById(id);
    }

    public void addStudentToGroup(Integer personId, Integer groupId) {
        GroupPersonId id = new GroupPersonId(personId, groupId);
    
        // Verificar si ya existe una inscripción para evitar duplicados
        if (groupPersonRepo.existsById(id)) {
            throw new IllegalStateException("El estudiante ya está inscrito en este grupo.");
        }
    
        // Obtener el grupo por su ID
        GroupInst group = groupRepo.findById(groupId)
                                   .orElseThrow(() -> new IllegalStateException("Grupo no encontrado"));

    

        GroupPerson groupPerson = new GroupPerson();
    
        groupPerson.setPerson_id(personService.getPersonById(personId)); 
        groupPerson.setGroup_id(group); 
    
        groupPerson.setStart_date(group.getStart_date()); 
        groupPerson.setEnd_date(group.getEnd_date());  
        groupPerson.setCalification(null); 
        groupPerson.setLevel_cost(0);    
        groupPerson.setMaterial_cost(0);  
        groupPerson.setLEVEL_MODALITY(null); 
        groupPerson.setLevel_duration("");
    
        groupPersonRepo.save(groupPerson);
    }
    
    
}
