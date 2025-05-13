package com.uptc.idiomas.certigest.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.uptc.idiomas.certigest.dto.GroupInstDTO;
import com.uptc.idiomas.certigest.dto.GroupPersonDTO;
import com.uptc.idiomas.certigest.dto.PersonDTONote;
import com.uptc.idiomas.certigest.dto.PersonEnrollInfo;
import com.uptc.idiomas.certigest.entity.Course;
import com.uptc.idiomas.certigest.entity.GroupInst;
import com.uptc.idiomas.certigest.entity.GroupPerson;
import com.uptc.idiomas.certigest.entity.GroupPersonId;
import com.uptc.idiomas.certigest.entity.Level;
import com.uptc.idiomas.certigest.entity.Person;
import com.uptc.idiomas.certigest.mapper.GroupInstMapper;
import com.uptc.idiomas.certigest.mapper.GroupPersonMapper;
import com.uptc.idiomas.certigest.repo.CourseRepo;
import com.uptc.idiomas.certigest.repo.GroupInstRepo;
import com.uptc.idiomas.certigest.repo.GroupPersonRepo;
import com.uptc.idiomas.certigest.repo.LevelRepo;

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
    @Autowired 
    private CourseRepo courseService;
    @Autowired 
    private LevelRepo levelService;

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

    public List<GroupInstDTO> findActiveByLevelId(Integer levelId) {
        return groupRepo.findActiveByLevelId(levelId)
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

    public List<GroupPersonDTO> getGroupsByStudentUsername(String username) {
        Person student = personService.getPersonByUserName(username);
        List<GroupPerson> groups = groupPersonRepo.findGroupsByStudentId(student.getPersonId());
        return groups.stream()
                .map(group -> GroupPersonMapper.INSTANCE.mapGroupPersonToGroupPersonDTO(group))
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
            personDTO.setFirstName(person.getFirstName());
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
                throw new IllegalStateException(
                        "El estudiante ya está inscrito en este grupo con calificación válida.");
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
         * groupPerson.setLEVEL_MODALITY(GroupPerson.LevelModality.valueOf(group.
         * getLevel_id().getLevel_modality().name()));
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

    public List<PersonEnrollInfo> enrollStudentsMassive(List<PersonEnrollInfo> enrollInfoList) {
    List<PersonEnrollInfo> failEnrollStudents = new ArrayList<>();

    for (PersonEnrollInfo student : enrollInfoList) {
        try {
            Optional<Person> personOpt = personService.getOptionalByDocument(student.getDocumentNumber());
            if (personOpt.isEmpty()) {
                student.setDescription("Estudiante no encontrado");
                failEnrollStudents.add(student);
                continue;
            }

            Optional<Course> courseOpt = courseService.findByCourse_name(student.getCourse());
            if (courseOpt.isEmpty()) {
                student.setDescription("Curso no encontrado");
                failEnrollStudents.add(student);
                continue;
            }

            int courseId = courseOpt.get().getId_course();

            Optional<Level> levelOpt = levelService.findByLevelNameAndCourseId(student.getLevel(), courseId);
            if (levelOpt.isEmpty()) {
                student.setDescription("Nivel no encontrado");
                failEnrollStudents.add(student);
                continue;
            }

            int levelId = levelOpt.get().getLevel_id();

            Optional<GroupInst> groupOpt = groupRepo.findByCourseIdAndLevelIdAndGroupName(courseId, levelId, student.getGroup());
            PersonEnrollInfo result;

            if (groupOpt.isPresent()) {
                result = enrollStudentToGroup(personOpt.get().getPersonId(), groupOpt.get().getGroup_id(), student);
            } else {
                try {
                    result = enrollStudentToGenericGroup(personOpt.get().getPersonId(), courseId, levelId, student);
                } catch (Exception e) {
                    student.setDescription("Error en inscripción a grupo genérico: " + e.getMessage());
                    failEnrollStudents.add(student);
                    continue;
                }
            }

            if (!"Agregado".equals(result.getDescription())) {
                failEnrollStudents.add(result);
            }

        } catch (Exception ex) {
            student.setDescription("Error general: " + ex.getMessage());
            failEnrollStudents.add(student);
        }
    }

    return failEnrollStudents;
}



    public PersonEnrollInfo enrollStudentToGenericGroup(Integer personId, Integer courseId, Integer levelId, PersonEnrollInfo student) {
    try {
        System.out.println("Antes de buscar el grupo genérico: " + student.getFullName());

        // Buscar si ya existe un grupo genérico para el curso y nivel dados
        Optional<GroupInst> existingGroupOpt = groupRepo.findByCourseIdAndLevelIdAndGroupName(courseId, levelId, "Grupo genérico");
        System.out.println("Entra: " + student.getFullName());

        GroupInst newGroupInst;
        if (existingGroupOpt.isPresent()) {
            newGroupInst = existingGroupOpt.get();
        } else {
            GroupInst newGroup = new GroupInst();
            newGroup.setGroup_name("Grupo genérico");
            newGroup.setState(false);

            Level level = levelService.findByLevelNameAndCourseId(student.getLevel(), courseId)
                .orElseThrow(() -> new IllegalStateException("Nivel no encontrado para el curso ID: " + courseId + " y nivel: " + student.getLevel()));

            newGroup.setLevel_id(level);
            newGroupInst = groupRepo.save(newGroup);
            System.out.println("Grupo genérico creado con ID: " + newGroupInst.getGroup_id());
        }

        // Validar si ya está registrado en ese grupo
        GroupPersonId newId = new GroupPersonId(personId, newGroupInst.getGroup_id());
        Optional<GroupPerson> existing = groupPersonRepo.findById(newId);
        if (existing.isPresent()) {
            student.setDescription("El estudiante ya está inscrito en el nivel");
            return student;
        }

        // Obtener persona
        Person person = personService.getPersonById(personId);
        if (person == null) {
            throw new IllegalStateException("Persona no encontrada con ID: " + personId);
        }

        GroupPerson groupPerson = new GroupPerson();
        groupPerson.setId(newId);
        groupPerson.setPerson_id(person);
        groupPerson.setGroup_id(newGroupInst);

        groupPerson.setStart_date(student.getStartDate());
        groupPerson.setEnd_date(student.getEndDate());
        groupPerson.setCalification(student.getGrade());
        groupPerson.setLevel_cost(student.getLevelCost());
        groupPerson.setMaterial_cost(student.getMaterialCost());

        LocalDate start = student.getStartDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate end = student.getEndDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        long days = ChronoUnit.DAYS.between(start, end);
        long weeks = days / 7;
        groupPerson.setLevel_duration(weeks + " semanas");

        groupPersonRepo.save(groupPerson);
        student.setDescription("Agregado");
        System.out.println("Asociación guardada exitosamente");

        return student;
    } catch (Exception e) {
        System.err.println("Error al matricular al estudiante: " + e.getMessage());
        student.setDescription("Error en inscripción: " + e.getMessage());
        return student;
    }
}

 

    public PersonEnrollInfo enrollStudentToGroup(Integer personId, Integer groupId, PersonEnrollInfo student) {
    GroupPersonId id = new GroupPersonId(personId, groupId);

    Optional<GroupPerson> existing = groupPersonRepo.findById(id);
    if (existing.isPresent()) {
        student.setDescription("El estudiante ya está inscrito en este grupo");
        return student;
    }

    GroupInst group = groupRepo.findById(groupId)
            .orElseThrow(() -> new IllegalStateException("Grupo no encontrado"));

    GroupPerson groupPerson = new GroupPerson();
    groupPerson.setId(id);
    groupPerson.setPerson_id(personService.getPersonById(personId));
    groupPerson.setGroup_id(group);

    groupPerson.setStart_date(student.getStartDate());
    groupPerson.setEnd_date(student.getEndDate());
    groupPerson.setCalification(student.getGrade());
    groupPerson.setLevel_cost(student.getLevelCost());
    groupPerson.setMaterial_cost(student.getMaterialCost());

    LocalDate start = student.getStartDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    LocalDate end = student.getEndDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    long days = ChronoUnit.DAYS.between(start, end);
    long weeks = days / 7;
    groupPerson.setLevel_duration(weeks + " semanas");

    groupPersonRepo.save(groupPerson);
    student.setDescription("Agregado");
    System.out.println("Estudiante inscrito correctamente: " + student.getFullName());
    return student;
}

}