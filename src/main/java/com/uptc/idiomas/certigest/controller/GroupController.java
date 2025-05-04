package com.uptc.idiomas.certigest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import com.uptc.idiomas.certigest.dto.GroupInstDTO;
import com.uptc.idiomas.certigest.service.GroupService;
import com.uptc.idiomas.certigest.dto.PersonDTO;
import com.uptc.idiomas.certigest.dto.PersonDTONote;


@RestController
@RequestMapping("/group")
public class GroupController {

    @Autowired
    private GroupService groupService;

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

    @PutMapping
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

    @PostMapping("/qualifyGroup/{groupId}")
    public ResponseEntity<String> calificateGroup(@PathVariable Integer groupId, @RequestBody List<PersonDTONote> students) {
        groupService.qualifyGroup(students, groupId);
        return new ResponseEntity<>("Calification successful", HttpStatus.OK);
    }
}
