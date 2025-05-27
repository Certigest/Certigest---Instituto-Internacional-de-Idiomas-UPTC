package com.uptc.idiomas.certigest.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.uptc.idiomas.certigest.dto.CredentialDTO;
import com.uptc.idiomas.certigest.dto.PersonDTO;
import com.uptc.idiomas.certigest.service.CredentialsKeycloakService;
import com.uptc.idiomas.certigest.service.PersonService;
import java.nio.file.*;

/**
 * Controlador REST para la gestión de personas en la plataforma.
 * Proporciona endpoints para crear, obtener, modificar y eliminar personas,
 * así como para gestionar imágenes de perfil y verificar la existencia de
 * documentos y correos electrónicos.
 */
@RestController
@RequestMapping("/person")
public class PersonController {

    @Autowired
    PersonService personService;
    @Autowired
    CredentialsKeycloakService credentialsKeycloakService;

    private static final String UPLOAD_DIR = "uploads/profiles/";

    /**
     * Crea una nueva persona en la base de datos.
     *
     * @param personDTO Objeto que contiene los datos de la persona a crear.
     * @return ResponseEntity con el objeto PersonDTO creado y el código de estado
     *         HTTP 201 (CREATED).
     */
    @PostMapping("/addPerson")
    public ResponseEntity<PersonDTO> savePerson(@RequestBody PersonDTO personDTO) {
        PersonDTO personAdded = personService.addPersonInDb(personDTO);
        return new ResponseEntity<>(personAdded, HttpStatus.CREATED);
    }

    /**
     * Actualiza los datos de una persona en la base de datos.
     *
     * @param personDTO Objeto que contiene los nuevos datos de la persona.
     * @return ResponseEntity con el objeto PersonDTO actualizado y el código de
     *         estado HTTP 200 (OK).
     */
    @GetMapping("/allPerson")
    public ResponseEntity<List<PersonDTO>> getAllPersons() {
        List<PersonDTO> persons = personService.getAllPersons();
        return ResponseEntity.ok(persons);
    }

    /**
     * Elimina una persona de la base de datos por su ID.
     *
     * @param id ID de la persona a eliminar.
     * @return ResponseEntity con un mensaje de éxito o error y el código de estado
     *         HTTP correspondiente.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePerson(@PathVariable Integer id) {
        try {
            personService.deletePersonById(id);
            return new ResponseEntity<>("Persona eliminada exitosamente", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Error al eliminar persona: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtiene una persona de la base de datos por su ID.
     *
     * @param id ID de la persona a obtener.
     * @return ResponseEntity con el objeto PersonDTO encontrado y el código de
     *         estado HTTP 200 (OK) o 404 (NOT FOUND) si no se encuentra la persona.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PersonDTO> getPersonById(@PathVariable Integer id) {
        PersonDTO person = personService.findById(id);
        return person != null ? ResponseEntity.ok(person) : ResponseEntity.notFound().build();
    }

    /**
     * Verifica si existe una persona en la base de datos por su documento.
     *
     * @param document Documento de la persona a verificar.
     * @return ResponseEntity con un booleano que indica si la persona existe o no.
     */
    @GetMapping("/existsByDocument")
    public ResponseEntity<Boolean> existsByDocument(@RequestParam String document) {
        boolean exists = personService.existsByDocument(document);
        return ResponseEntity.ok(exists);
    }

    /**
     * Verifica si existe una persona en la base de datos por su correo electrónico.
     *
     * @param email Correo electrónico de la persona a verificar.
     * @return ResponseEntity con un booleano que indica si la persona existe o no.
     */
    @GetMapping("/existsByEmail")
    public ResponseEntity<Boolean> existsByEmail(@RequestParam String email) {
        boolean exists = personService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    /**
     * Verifica si existe una persona en la base de datos por su número de teléfono.
     *
     * @param phoneNumber Número de teléfono de la persona a verificar.
     * @return ResponseEntity con un booleano que indica si la persona existe o no.
     */
    @GetMapping("/personal-account")
    public ResponseEntity<PersonDTO> getAccountInfo(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaim("preferred_username");
        PersonDTO personInfo = personService.getAccountInfoByUsername(username);
        return new ResponseEntity<>(personInfo, HttpStatus.OK);
    }

    /**
     * Modifica los datos de una cuenta de usuario.
     *
     * @param personDTO Objeto que contiene los nuevos datos de la cuenta.
     * @return ResponseEntity con un mensaje de éxito y el código de estado HTTP 200
     *         (OK).
     */
    @PutMapping("/modify")
    public ResponseEntity<String> modifyAccount(@RequestBody PersonDTO personDTO) {
        personService.modifyAccount(personDTO);
        return ResponseEntity.ok("Cuenta modificada exitosamente.");
    }

    /**
     * Modifica la información de una cuenta de usuario.
     *
     * @param jwt       Token JWT del usuario autenticado.
     * @param personDTO Objeto que contiene los nuevos datos de la cuenta.
     * @return ResponseEntity con el objeto PersonDTO actualizado y el código de
     *         estado HTTP 200 (OK).
     */
    @PostMapping("/modify-personal-account")
    public ResponseEntity<PersonDTO> modifyAccountInfo(@AuthenticationPrincipal Jwt jwt,
            @RequestBody PersonDTO personDTO) {
        String username = jwt.getClaim("preferred_username");
        PersonDTO personInfo = personService.ModifyAccountInfo(personDTO, username);
        return new ResponseEntity<>(personInfo, HttpStatus.OK);
    }

    /**
     * Modifica la contraseña de un usuario.
     *
     * @param jwt        Token JWT del usuario autenticado.
     * @param credential Objeto que contiene la nueva contraseña.
     * @return ResponseEntity con un mensaje de éxito y el código de estado HTTP 200
     *         (OK).
     */
    @PostMapping("/modifyPassword")
    public ResponseEntity<String> updatePassword(@AuthenticationPrincipal Jwt jwt,
            @RequestBody CredentialDTO credential) {
        try {
            String accessToken = credentialsKeycloakService.obtainAdminAccessToken();
            String userId = credentialsKeycloakService.getUserIdByUsername(jwt.getClaimAsString("preferred_username"),
                    accessToken); // Paso 2
            credentialsKeycloakService.resetPassword(userId, credential.getPassword(), accessToken);

            return new ResponseEntity<>("Contraseña actualizada", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al actualizar contraseña: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    /**
     * Verifica la contraseña de un usuario.
     *
     * @param jwt        Token JWT del usuario autenticado.
     * @param credential Objeto que contiene la  contraseña.
     * @return {@code 200 OK} con el cuerpo {@code true} si la contraseña es válida,
     *         {@code false} si es incorrecta, o {@code 500 Internal Server Error} en caso de error inesperado.
     */
    @PostMapping("/verifyPassword")
    public ResponseEntity<Boolean> verifyCurrentPassword(@AuthenticationPrincipal Jwt jwt,
                                                         @RequestBody CredentialDTO credential) {
        try {
            String username = jwt.getClaimAsString("preferred_username");
            boolean isValid = credentialsKeycloakService.isCurrentPasswordValid(username, credential.getPassword());
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(false);
        }
    }

    /**
     * Obtiene la información de un estudiante por su ID.
     *
     * @param id ID del estudiante a obtener.
     * @return ResponseEntity con el objeto PersonDTO encontrado y el código de
     *         estado HTTP 200 (OK) o 404 (NOT FOUND) si no se encuentra el
     *         estudiante.
     */
    @GetMapping("/students")
    public List<PersonDTO> getStudents() {
        return personService.getStudents();
    }

    /**
     * Obtiene la información de un profesor por su ID.
     *
     * @param id ID del profesor a obtener.
     * @return ResponseEntity con el objeto PersonDTO encontrado y el código de
     *         estado HTTP 200 (OK) o 404 (NOT FOUND) si no se encuentra el
     *         profesor.
     */
    @GetMapping("/admins")
    public List<PersonDTO> getAdmins() {
        return personService.getAdmins();
    }

    /**
     * Obtiene la información de un profesor por su ID.
     *
     * @param id ID del profesor a obtener.
     * @return ResponseEntity con el objeto PersonDTO encontrado y el código de
     *         estado HTTP 200 (OK) o 404 (NOT FOUND) si no se encuentra el
     *         profesor.
     */
    @GetMapping("/teachers")
    public List<PersonDTO> getTeachers() {
        return personService.getTeachers();
    }

    /**
     * Sube una imagen de perfil para el usuario autenticado.
     *
     * @param file Archivo de imagen a subir.
     * @param jwt  Token JWT del usuario autenticado.
     * @return Mensaje de éxito.
     * @throws IOException Si ocurre un error al guardar la imagen.
     */
    @PostMapping("/upload")
    public String uploadProfileImage(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal Jwt jwt)
            throws IOException {
        String username = jwt.getClaim("preferred_username");
        PersonDTO personInfo = personService.getAccountInfoByUsername(username);
        // Crear carpeta si no existe
        Path path = Paths.get(UPLOAD_DIR);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }

        // Definir el nombre del archivo con el ID del usuario
        String fileName = personInfo.getPersonId() + ".jpg";
        Path filePath = path.resolve(fileName);

        // Guardar el archivo
        file.transferTo(filePath);

        return "Imagen de perfil subida exitosamente.";
    }

    /**
     * Obtiene la imagen de perfil del usuario autenticado.
     *
     * @param jwt Token JWT del usuario autenticado.
     * @return ResponseEntity con la imagen de perfil o un error 404 si no se
     *         encuentra la imagen.
     * @throws IOException Si ocurre un error al leer la imagen.
     */
    @GetMapping("/image")
    public ResponseEntity<Resource> getProfileImage(@AuthenticationPrincipal Jwt jwt) throws IOException {
        String username = jwt.getClaim("preferred_username");
        PersonDTO personInfo = personService.getAccountInfoByUsername(username);
        Path filePath = Paths.get(UPLOAD_DIR).resolve(personInfo.getPersonId() + ".jpg");

        if (Files.exists(filePath)) {
            Resource resource = new UrlResource(filePath.toUri());
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Obtiene la información de los estudiantes que no han tomado un nivel
     * específico.
     *
     * @param levelId ID del nivel a verificar.
     * @return Lista de objetos PersonDTO que representan a los estudiantes que no
     *         han tomado el nivel.
     */
    @GetMapping("/studentsWhoHaveNotTakenLevel/{levelId}")
    public List<PersonDTO> getStudentsWhoHaveNotTakenLevel(@PathVariable Integer levelId) {
        return personService.getStudentsWhoHaveNotTakenLevel(levelId);
    }
}
