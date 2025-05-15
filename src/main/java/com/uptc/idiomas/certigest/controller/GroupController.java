package com.uptc.idiomas.certigest.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import com.uptc.idiomas.certigest.dto.GroupInstDTO;
import com.uptc.idiomas.certigest.dto.GroupPersonDTO;
import com.uptc.idiomas.certigest.service.GroupService;
import com.uptc.idiomas.certigest.dto.PersonDTONote;
import com.uptc.idiomas.certigest.dto.PersonEnrollInfo;

/**
 * Controlador REST para la gestión de grupos en la plataforma.
 * Proporciona endpoints para crear, obtener, actualizar y eliminar grupos,
 * así como para inscribir estudiantes y calificar grupos.
 */
@RestController
@RequestMapping("/group")
public class GroupController {

    @Autowired
    private GroupService groupService;

    /**
     * Obtiene un grupo por su ID.
     *
     * @param id ID del grupo a obtener.
     * @return ResponseEntity con el grupo encontrado y el código de estado HTTP 200
     *         (OK) o 404 (NOT FOUND) si no se encuentra el grupo.
     */
    @GetMapping("/by-level/{levelId}")
    public ResponseEntity<List<GroupInstDTO>> getGroupsByLevel(@PathVariable Integer levelId) {
        List<GroupInstDTO> groups = groupService.findActiveByLevelId(levelId);
        return ResponseEntity.ok(groups);
    }

    /**
     * Obtiene un grupo por su ID.
     *
     * @param id ID del grupo a obtener.
     * @return ResponseEntity con el grupo encontrado y el código de estado HTTP 200
     *         (OK) o 404 (NOT FOUND) si no se encuentra el grupo.
     */
    @GetMapping("/teacher")
    public ResponseEntity<List<GroupInstDTO>> getGroupsByTeacher(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaim("preferred_username");
        return new ResponseEntity<>(groupService.getGroupsByTeacher(username), HttpStatus.OK);
    }

    /**
     * Crea un nuevo grupo.
     *
     * @param groupDTO Objeto que contiene los datos del grupo a crear.
     * @return ResponseEntity con el grupo creado y el código de estado HTTP 201
     *         (CREATED).
     */
    @PostMapping("/createGroup")
    public ResponseEntity<GroupInstDTO> createGroup(@RequestBody GroupInstDTO groupDTO) {
        GroupInstDTO created = groupService.create(groupDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Actualiza un grupo existente.
     *
     * @param groupDTO Objeto que contiene los datos del grupo a actualizar.
     * @return ResponseEntity con el grupo actualizado y el código de estado HTTP
     *         200
     *         (OK).
     */
    @GetMapping("/{id}")
    public ResponseEntity<GroupInstDTO> getGroupById(@PathVariable Integer id) {
        GroupInstDTO group = groupService.findById(id);
        return group != null ? ResponseEntity.ok(group) : ResponseEntity.notFound().build();
    }

    /**
     * Obtiene todos los grupos.
     *
     * @return ResponseEntity con la lista de grupos y el código de estado HTTP 200
     *         (OK).
     */
    @GetMapping("/all")
    public ResponseEntity<List<GroupInstDTO>> getAllGroups() {
        return ResponseEntity.ok(groupService.findAll());
    }

    /**
     * Actualiza un grupo existente.
     *
     * @param groupDTO Objeto que contiene los datos del grupo a actualizar.
     * @return ResponseEntity con el grupo actualizado y el código de estado HTTP
     *         200
     *         (OK).
     */
    @PutMapping("/update")
    public ResponseEntity<GroupInstDTO> updateGroup(@RequestBody GroupInstDTO groupDTO) {
        GroupInstDTO updated = groupService.update(groupDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * Elimina un grupo por su ID.
     *
     * @param id ID del grupo a eliminar.
     * @return ResponseEntity con el código de estado HTTP 204 (NO CONTENT).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Integer id) {
        groupService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtiene los estudiantes de un grupo por su ID.
     *
     * @param groupId ID del grupo.
     * @return ResponseEntity con la lista de estudiantes y el código de estado HTTP
     *         200 (OK).
     */
    @GetMapping("/studentsGroup/{groupId}")
    public ResponseEntity<List<PersonDTONote>> getStudentsGroup(@PathVariable Integer groupId) {
        return new ResponseEntity<>(groupService.getPersonsByGroupIdAndActiveDate(groupId), HttpStatus.OK);
    }

    /**
     * Obtiene los grupos a los que está inscrito un estudiante.
     *
     * @param jwt Token JWT del usuario autenticado.
     * @return ResponseEntity con la lista de grupos y el código de estado HTTP 200
     *         (OK).
     */
    @GetMapping("/groupsStudent")
    public ResponseEntity<List<GroupPersonDTO>> getGroupsByStudent(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaim("preferred_username");
        List<GroupPersonDTO> groups = groupService.getGroupsByStudentUsername(username);
        return new ResponseEntity<>(groups, HttpStatus.OK);
    }

    /**
     * Califica un grupo.
     *
     * @param groupId  ID del grupo a calificar.
     * @param students Lista de estudiantes con sus calificaciones.
     * @return ResponseEntity con un mensaje de éxito y el código de estado HTTP 200
     *         (OK).
     */
    @PostMapping("/qualifyGroup/{groupId}")
    public ResponseEntity<String> calificateGroup(@PathVariable Integer groupId,
            @RequestBody List<PersonDTONote> students) {
        groupService.qualifyGroup(students, groupId);
        return new ResponseEntity<>("Calification successful", HttpStatus.OK);
    }

    /**
     * Inscribe un estudiante en un grupo.
     *
     * @param groupId   ID del grupo.
     * @param studentId ID del estudiante.
     * @return ResponseEntity con el código de estado HTTP 204 (NO CONTENT).
     */
    @DeleteMapping("/{groupId}/student/{studentId}")
    public ResponseEntity<Void> removeStudentFromGroup(
            @PathVariable Integer groupId,
            @PathVariable Integer studentId) {
        groupService.removeStudentFromGroup(studentId, groupId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Inscribe un estudiante en un grupo.
     *
     * @param personId ID del estudiante.
     * @param groupId  ID del grupo.
     * @return ResponseEntity con un mensaje de éxito y el código de estado HTTP 200
     *         (OK).
     */
    @PostMapping("/enroll/{personId}/{groupId}")
    public ResponseEntity<String> enrollStudent(@PathVariable Integer personId, @PathVariable Integer groupId) {
        try {
            groupService.addStudentToGroup(personId, groupId);
            return ResponseEntity.ok("Estudiante inscrito correctamente.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al inscribir al estudiante.");
        }
    }

    /**
     * Inscribe a varios estudiantes en un grupo de forma masiva.
     *
     * @param studentsList Lista de objetos PersonEnrollInfo que contienen la
     *                     información de los estudiantes a inscribir.
     * @return ResponseEntity con la lista de estudiantes inscritos y el código de
     *         estado HTTP 200 (OK).
     */
    @PostMapping("/enrollMassive")
    public ResponseEntity<?> enrollStudentsMassive(@RequestBody List<PersonEnrollInfo> studentsList) {
        try {
            List<PersonEnrollInfo> response = groupService.enrollStudentsMassive(studentsList);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al inscribir a los estudiantes."));
        }
    }

    @GetMapping("/groupsByPerson/{personId}")
    public ResponseEntity<List<GroupPersonDTO>> getGroupsByPerson(@PathVariable Integer personId) {
        return ResponseEntity.ok(groupService.getGroupsByStudentByPersonId(personId));
    }
}
