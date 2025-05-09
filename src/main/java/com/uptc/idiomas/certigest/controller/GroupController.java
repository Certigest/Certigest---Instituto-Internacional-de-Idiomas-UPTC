package com.uptc.idiomas.certigest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import com.nimbusds.jwt.JWT;
import com.uptc.idiomas.certigest.dto.GroupInstDTO;
import com.uptc.idiomas.certigest.service.GroupService;
import com.uptc.idiomas.certigest.dto.PersonDTO;
import com.uptc.idiomas.certigest.dto.PersonDTONote;

@RestController
@RequestMapping("/group")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @GetMapping("/by-level/{levelId}")
    public ResponseEntity<List<GroupInstDTO>> getGroupsByLevel(@PathVariable Integer levelId) {
        List<GroupInstDTO> groups = groupService.findByLevelId(levelId);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/teacher")
    public ResponseEntity<List<GroupInstDTO>> getMethodName(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaim("preferred_username");
        return new ResponseEntity<>(groupService.getGroupsByTeacher(username), HttpStatus.OK);
    }

    @PostMapping("/createGroup")
    public ResponseEntity<GroupInstDTO> createGroup(@RequestBody GroupInstDTO groupDTO) {
        GroupInstDTO created = groupService.create(groupDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupInstDTO> getGroupById(@PathVariable Integer id) {
        GroupInstDTO group = groupService.findById(id);
        return group != null ? ResponseEntity.ok(group) : ResponseEntity.notFound().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<GroupInstDTO>> getAllGroups() {
        return ResponseEntity.ok(groupService.findAll());
    }

    @PutMapping("/update")
    public ResponseEntity<GroupInstDTO> updateGroup(@RequestBody GroupInstDTO groupDTO) {
        GroupInstDTO updated = groupService.update(groupDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Integer id) {
        groupService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/studentsGroup/{groupId}")
    public ResponseEntity<List<PersonDTO>> getStudentsGroup(@PathVariable Integer groupId) {
        return new ResponseEntity<>(groupService.getPersonsByGroupIdAndActiveDate(groupId), HttpStatus.OK);
    }

    @GetMapping("/groupsStudent")
    public ResponseEntity<List<GroupInstDTO>> getGroupsByStudent(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaim("preferred_username");
        List<GroupInstDTO> groups = groupService.getGroupsByStudentUsername(username);
        return new ResponseEntity<>(groups, HttpStatus.OK);
    }

    @PostMapping("/qualifyGroup/{groupId}")
    public ResponseEntity<String> calificateGroup(@PathVariable Integer groupId,
            @RequestBody List<PersonDTONote> students) {
        groupService.qualifyGroup(students, groupId);
        return new ResponseEntity<>("Calification successful", HttpStatus.OK);
    }

    @DeleteMapping("/{groupId}/student/{studentId}")
    public ResponseEntity<Void> removeStudentFromGroup(
            @PathVariable Integer groupId,
            @PathVariable Integer studentId) {
        groupService.removeStudentFromGroup(studentId, groupId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/enroll/{personId}/{groupId}")
    public ResponseEntity<String> enrollStudent(@PathVariable Integer personId, @PathVariable Integer groupId) {
        System.out.println("Enrolling student with ID: " + personId + " to group with ID: " + groupId);
        try {
            groupService.addStudentToGroup(personId, groupId);
            return ResponseEntity.ok("Estudiante inscrito correctamente.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al inscribir al estudiante.");
        }
    }
}
