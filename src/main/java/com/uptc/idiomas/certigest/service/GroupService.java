package com.uptc.idiomas.certigest.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Optional;

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
    public List<GroupInstDTO> findAll() {
        return groupRepo.findAllActiveGroups()
                .stream()
                .map(mapper::mapGroupInstToGroupInstDTO)
                .collect(Collectors.toList());
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

    public List<GroupInstDTO> getGroupsByStudentUsername(String username) {
        Person student = personService.getPersonByUserName(username);
        List<GroupInst> groups = groupPersonRepo.findGroupsByStudentId(student.getPersonId());
        return groups.stream()
                .map(group -> GroupInstMapper.INSTANCE.mapGroupInstToGroupInstDTO(group))
                .collect(Collectors.toList());
    }

    public List<PersonDTONote> getPersonsByGroupIdAndActiveDate(Integer groupId) {
        List<Person> persons = groupPersonRepo.findPersonsByGroupIdAndActiveDate(groupId, new Date());
        GroupPerson groupPerson = null;
        List<PersonDTONote> personDTOList = new ArrayList<>();
        for (Person person : persons) {
            groupPerson = groupPersonRepo.findById(new GroupPersonId(person.getPersonId(), groupId))
                .orElseThrow(() -> new EntityNotFoundException("Grupo no encontrado"));
            PersonDTONote personDTO = new PersonDTONote();
            personDTO.setStudentId(person.getPersonId());
            personDTO.setDocument(person.getDocument());
            personDTO.setFirstName( person.getFirstName());
            personDTO.setLastName(person.getLastName());
            personDTO.setEmail(person.getEmail());
            personDTO.setCalification(groupPerson.getCalification());
            personDTOList.add(personDTO);
        }
        return personDTOList;
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

        Optional<GroupPerson> existing = groupPersonRepo.findById(id);
        if (existing.isPresent()) {
            Float calification = existing.get().getCalification();
            if (calification == null || calification >= 30) {
                throw new IllegalStateException("El estudiante ya está inscrito en este grupo con calificación válida.");
            } else {
                System.out.println("Reinscribiendo al estudiante con calificación anterior: " + calification);
                groupPersonRepo.deleteById(id);
            }
        }

        GroupInst group = groupRepo.findById(groupId)
                .orElseThrow(() -> new IllegalStateException("Grupo no encontrado"));

        GroupPerson groupPerson = new GroupPerson();
        groupPerson.setId(id);
        groupPerson.setPerson_id(personService.getPersonById(personId));
        groupPerson.setGroup_id(group);

        groupPerson.setStart_date(group.getStart_date());
        groupPerson.setEnd_date(group.getEnd_date());
        groupPerson.setCalification(null);
        groupPerson.setLevel_cost(group.getLevel_id().getLevel_cost());
        groupPerson.setMaterial_cost(group.getLevel_id().getMaterial_cost());
        /* 
        groupPerson.setLEVEL_MODALITY(GroupPerson.LevelModality.valueOf(group.getLevel_id().getLevel_modality().name()));
        */
        LocalDate start = group.getStart_date().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate end = group.getEnd_date().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

        long days = ChronoUnit.DAYS.between(start, end);
        long weeks = days / 7;
        groupPerson.setLevel_duration(weeks + " semanas");
        
        groupPersonRepo.save(groupPerson);
    }

    public GroupPerson getGroupByPersonAndLevel(Integer personId, Integer levelId) {
        List<GroupInst> allGroups = groupRepo.findAll();
        for (GroupInst group : allGroups) {
            if (group.getLevel_id().getLevel_id().equals(levelId)) {
                GroupPersonId groupPersonId = new GroupPersonId(personId, group.getGroup_id());
                Optional<GroupPerson> groupPersonOptional = groupPersonRepo.findById(groupPersonId);
                if (groupPersonOptional.isPresent()) {
                    return groupPersonOptional.get();
                }
            }
        }
        throw new EntityNotFoundException("No se encontro inscrito al estudiante en ningun grupo para ese nivel");
    }

    public List<GroupPerson> getGroupByPerson(Integer personId) {
        List<GroupPerson> groupPersonList = new ArrayList<>();
        for (GroupPerson gp : groupPersonRepo.findAll()) {
            if (gp.getPerson_id().getPersonId().equals(personId))
                groupPersonList.add(gp);
        } 
        return groupPersonList;
    }
}
