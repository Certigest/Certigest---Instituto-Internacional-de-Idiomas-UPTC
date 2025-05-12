package com.uptc.idiomas.certigest.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.uptc.idiomas.certigest.dto.GroupInstDTO;
import com.uptc.idiomas.certigest.entity.GroupInst;
import com.uptc.idiomas.certigest.entity.GroupPerson;
import com.uptc.idiomas.certigest.entity.GroupPersonId;
import com.uptc.idiomas.certigest.entity.Level;
import com.uptc.idiomas.certigest.entity.Person;
import com.uptc.idiomas.certigest.repo.GroupInstRepo;
import com.uptc.idiomas.certigest.repo.GroupPersonRepo;

import jakarta.persistence.EntityNotFoundException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@ExtendWith(MockitoExtension.class)
public class GroupServiceTest {

    @InjectMocks
    private GroupService groupService;

    @Mock
    private PersonService personService;
    @Mock
    private GroupPersonService groupPersonService;
    @Mock
    private GroupInstRepo groupRepo;
    @Mock
    private GroupPersonRepo groupPersonRepo;

    private GroupInst group;

    @BeforeEach
    void setUp() {
        group = new GroupInst();
        group.setGroup_name("G1");
        group.setGroup_teacher(new Person());
    }

    @Test
    void testGetRepo() {
        JpaRepository<GroupInst, Integer> repo = groupService.getRepo();
        assertEquals(groupRepo, repo);
    }

    @Test
    void testToEntityAndToDTO() {
        GroupInstDTO dto = new GroupInstDTO();
        dto.setGroup_name("Name");
        GroupInst entity = groupService.toEntity(dto);
        assertEquals(dto.getGroup_id(), entity.getGroup_id());
        assertEquals(dto.getGroup_name(), entity.getGroup_name());

        GroupInstDTO back = groupService.toDTO(group);
        assertEquals(group.getGroup_id(), back.getGroup_id());
        assertEquals(group.getGroup_name(), back.getGroup_name());
    }

    @Test
    void testFindAll() {
        GroupInst g1 = new GroupInst();
        g1.setGroup_name("A");
        when(groupRepo.findAllActiveGroups()).thenReturn(Collections.singletonList(g1));
        List<GroupInstDTO> result = groupService.findAll();
        assertEquals(1, result.size());
        assertEquals("A", result.get(0).getGroup_name());
    }

    @Test
    void testDeleteById_NoEndDate() {
        when(groupRepo.findById(group.getGroup_id())).thenReturn(Optional.of(group));
        groupService.deleteById(group.getGroup_id());
        assertFalse(group.getState());
        verify(groupRepo).save(group);
        verify(groupPersonService, never()).deleteAllByGroupId(anyInt());
        verify(groupRepo, never()).deleteById(anyInt());
    }

    @Test
    void testDeleteById_FutureEndDate() {
        Date future = Date.from(LocalDate.now().plusDays(5)
                .atStartOfDay(ZoneId.systemDefault()).toInstant());
        group.setEnd_date(future);
        when(groupRepo.findById(group.getGroup_id())).thenReturn(Optional.of(group));
        groupService.deleteById(group.getGroup_id());
        assertFalse(group.getState());
        verify(groupRepo).save(group);
        verify(groupPersonService, never()).deleteAllByGroupId(anyInt());
    }

    @Test
    void testDeleteById_PastEndDate() {
        Date past = Date.from(LocalDate.now().minusDays(5)
                .atStartOfDay(ZoneId.systemDefault()).toInstant());
        group.setEnd_date(past);
        when(groupRepo.findById(group.getGroup_id())).thenReturn(Optional.of(group));
        groupService.deleteById(group.getGroup_id());
        verify(groupPersonService).deleteAllByGroupId(group.getGroup_id());
        verify(groupRepo).deleteById(group.getGroup_id());
    }

    @Test
    void testDeleteById_NotFound() {
        when(groupRepo.findById(999)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> groupService.deleteById(999));
    }

    @Test
    void testFindByLevelId() {
        GroupInst g1 = new GroupInst();
        g1.setLevel_id(new Level());
        when(groupRepo.findByLevelId(10)).thenReturn(Collections.singletonList(g1));
        List<GroupInstDTO> list = groupService.findByLevelId(10);
        assertEquals(1, list.size());
        assertEquals(g1.getGroup_id(), list.get(0).getGroup_id());
    }

    @Test
    void testGetGroupsByTeacher() {
        String user = "user1";
        Person p = new Person();
        p.setDocument("doc1");
        when(personService.getPersonByUserName(user)).thenReturn(p);
        GroupInst g1 = new GroupInst();
        g1.setGroup_teacher(p);
        when(groupService.getGroupActiveByDateRange()).thenReturn(Arrays.asList(g1));
        List<GroupInstDTO> out = groupService.getGroupsByTeacher(user);
        assertEquals(1, out.size());
        assertEquals(g1.getGroup_id(), out.get(0).getGroup_id());
    }

    @Test
    void testGetGroupsByStudentUsername() {
        String user = "stud1";
        Person s = new Person();
        when(personService.getPersonByUserName(user)).thenReturn(s);
        GroupInst g = new GroupInst();
        when(groupPersonRepo.findGroupsByStudentId(s.getPersonId())).thenReturn(Collections.singletonList(g));
        List<GroupInstDTO> out = groupService.getGroupsByStudentUsername(user);
        assertEquals(1, out.size());
        assertEquals(g.getGroup_id(), out.get(0).getGroup_id());
    }

    @Test
    void testUpdateCalification() {
        GroupPersonId id = new GroupPersonId(1, 2);
        GroupPerson gp = new GroupPerson();
        gp.setId(id);
        when(groupPersonRepo.findById(id)).thenReturn(Optional.of(gp));
        groupService.updateCalification(1, 2, 3.5f);
        assertEquals(3.5f, gp.getCalification());
        assertNotNull(gp.getCalificationDate());
        verify(groupPersonRepo).save(gp);
    }

    @Test
    void testRemoveStudentFromGroup_NotExists() {
        GroupPersonId id = new GroupPersonId(1, 2);
        when(groupPersonRepo.existsById(id)).thenReturn(false);
        assertThrows(EntityNotFoundException.class,
                () -> groupService.removeStudentFromGroup(1, 2));
    }

    @Test
    void testRemoveStudentFromGroup_Exists() {
        GroupPersonId id = new GroupPersonId(1, 2);
        when(groupPersonRepo.existsById(id)).thenReturn(true);
        groupService.removeStudentFromGroup(1, 2);
        verify(groupPersonRepo).deleteById(id);
    }
}
