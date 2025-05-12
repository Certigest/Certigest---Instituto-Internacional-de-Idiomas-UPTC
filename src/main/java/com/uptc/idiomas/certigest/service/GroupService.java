package com.uptc.idiomas.certigest.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.swing.GroupLayout;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.uptc.idiomas.certigest.dto.GroupInstDTO;
import com.uptc.idiomas.certigest.dto.PersonDTONote;
import com.uptc.idiomas.certigest.dto.PersonEnrollInfo;
import com.uptc.idiomas.certigest.entity.Course;
import com.uptc.idiomas.certigest.entity.GroupInst;
import com.uptc.idiomas.certigest.entity.GroupPerson;
import com.uptc.idiomas.certigest.entity.GroupPersonId;
import com.uptc.idiomas.certigest.entity.Level;
import com.uptc.idiomas.certigest.entity.Person;
import com.uptc.idiomas.certigest.mapper.GroupInstMapper;
import com.uptc.idiomas.certigest.mapper.PersonMapper;
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

    public boolean hasPersonSeenLevel(Integer personId, Integer levelId) {
        return levelService.countByPersonIdAndLevelId(personId, levelId) > 0;
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

                // Verificar si el estudiante ya vio este nivel
                if (hasPersonSeenLevel(personOpt.get().getPersonId(), levelId)) {
                    student.setDescription("El estudiante ya vio o está viendo el nivel");
                    failEnrollStudents.add(student);
                    continue;
                }

                // Inscribir al estudiante en un grupo genérico si no lo ha visto
                try {
                    PersonEnrollInfo result = enrollStudentToGenericGroup(personOpt.get().getPersonId(), courseId, levelId, student);
                    if (!"Agregado".equals(result.getDescription())) {
                        failEnrollStudents.add(result);
                    }
                } catch (Exception e) {
                    student.setDescription("Error en inscripción a grupo genérico: " + e.getMessage());
                    failEnrollStudents.add(student);
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
            System.out.println("Buscando grupo existente para curso y nivel: " + student.getFullName());

            // Obtener el primer grupo ordenado por group_id
            GroupInst newGroupInst = groupRepo.findAllByCourseIdAndLevelIdOrderByGroupId(courseId, levelId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No se encontró un grupo para el curso ID " + courseId + " y nivel ID " + levelId));

            GroupPersonId newId = new GroupPersonId(personId, newGroupInst.getGroup_id());
            Optional<GroupPerson> existing = groupPersonRepo.findById(newId);
            if (existing.isPresent()) {
                student.setDescription("El estudiante ya vio o está viendo el nivel");
                return student;
            }

            if (hasPersonSeenLevel(personId, levelId)) {
                student.setDescription("El estudiante ya vio o está viendo el nivel");
                return student;
            }

            Person person = personService.getPersonById(personId);
            if (person == null) {
                throw new IllegalStateException("Persona no encontrada con ID: " + personId);
            }

            GroupPerson groupPerson = new GroupPerson();
            groupPerson.setId(newId);
            groupPerson.setPerson_id(person);
            groupPerson.setGroup_id(newGroupInst);

            groupPerson.setCalification(student.getGrade());
            groupPerson.setCalificationDate(student.getLevelSeenDate());
            groupPerson.setLevel_cost(student.getLevelCost());
            groupPerson.setMaterial_cost(student.getMaterialCost());
            groupPerson.setLevel_duration("Duración no especificada");

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
}