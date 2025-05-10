package com.uptc.idiomas.certigest.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uptc.idiomas.certigest.dto.LocationDTO;
import com.uptc.idiomas.certigest.dto.PersonDTO;
import com.uptc.idiomas.certigest.dto.RoleDTO;
import com.uptc.idiomas.certigest.entity.Certificate;
import com.uptc.idiomas.certigest.entity.Location;
import com.uptc.idiomas.certigest.entity.Login;
import com.uptc.idiomas.certigest.entity.Person;
import com.uptc.idiomas.certigest.entity.PersonRole;
import com.uptc.idiomas.certigest.entity.Role;
import com.uptc.idiomas.certigest.entity.Role.RoleName;
import com.uptc.idiomas.certigest.mapper.LocationMapper;
import com.uptc.idiomas.certigest.mapper.PersonMapper;
import com.uptc.idiomas.certigest.repo.CertificateCodeRepo;
import com.uptc.idiomas.certigest.repo.CertificateLevelRepo;
import com.uptc.idiomas.certigest.repo.CertificateRepo;
import com.uptc.idiomas.certigest.repo.GroupPersonRepo;
import com.uptc.idiomas.certigest.repo.LocationRepo;
import com.uptc.idiomas.certigest.repo.LoginRepo;
import com.uptc.idiomas.certigest.repo.PersonRepo;
import com.uptc.idiomas.certigest.repo.PersonRoleRepo;
import com.uptc.idiomas.certigest.repo.RoleRepo;

@Service
public class PersonService extends BasicServiceImpl<PersonDTO, Person, Integer> {

    @Autowired
    private PersonRepo personRepo;
    @Autowired
    private PersonRoleRepo personRoleRepo;
    @Autowired
    private LocationRepo locationRepo;
    @Autowired
    private LoginRepo loginRepo;
    @Autowired
    private KeycloakService keycloakService;
    @Autowired
    private RoleRepo roleRepo;
    @Autowired
    private GroupPersonRepo groupPersonRepo;
    @Autowired
    private CertificateRepo certificateRepo;
    @Autowired
    private CertificateLevelRepo certificateLevelRepo;
    @Autowired
    private CertificateCodeRepo certificateCodeRepo;
    //@Autowired
    //private EmailService emailService;

    

    @Override
    protected JpaRepository<Person, Integer> getRepo() {
        return personRepo;
    }
    public boolean existsByDocument(String document) {
        return personRepo.existsByDocument(document);
    }

    public boolean existsByEmail(String email) {
       return personRepo.existsByEmail(email);
    }
    public PersonDTO addPersonInDb(PersonDTO personDTO) {
    
        Location location = null;
    
        // Verificamos si la persona tiene una ubicación asociada
        if (personDTO.getLocation() != null && personDTO.getLocation().getIdLocation() != null) {
            location = locationRepo.findById(personDTO.getLocation().getIdLocation())
                    .orElse(null); // Si no existe, location será null
        }
    
        // Convertimos el DTO de la persona a una entidad Person
        Person person = PersonMapper.INSTANCE.mapPersonDTOToPerson(personDTO);
        person.setLocation(location); // Asignamos la ubicación si existe
        Person personSaved = personRepo.save(person); // Guardamos la persona en la base de datos
    
        // Crear un nombre de usuario único basado en el nombre y apellido
        String[] nameParts = personDTO.getFirstName().trim().split("\\s+");
        String[] lastNameParts = personDTO.getLastName().trim().split("\\s+");
        String baseUsername = nameParts[0].toLowerCase() + lastNameParts[0].toLowerCase();
        int count = 1;
        String finalUsername;
        do {
            finalUsername = baseUsername + count; // Generamos variaciones en caso de nombres duplicados
            count++;
        } while (loginRepo.existsByUserName(finalUsername)); // Verificamos si el nombre de usuario ya existe
    
        // Creamos un nuevo registro de login con el nombre de usuario generado
        Login login = new Login();
        login.setUserName(finalUsername);
        login.setPerson(personSaved);
        loginRepo.save(login); // Guardamos el login
    
        // Asociamos los roles a la persona si se recibieron en el DTO
        if (personDTO.getRoles() != null) {
            for (RoleDTO roleDTO : personDTO.getRoles()) {
                RoleName roleName = roleDTO.getName(); // Obtenemos el nombre del rol (e.g., ADMIN)
                Role role = roleRepo.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + roleName));
    
                // Asociamos el rol con la persona
                PersonRole personRole = new PersonRole();
                personRole.setPerson(personSaved);
                personRole.setRole(role);
                personRoleRepo.save(personRole); // Guardamos la asociación de rol
            }
        }
    
        // Creamos el usuario en Keycloak con los roles asignados
        List<String> rolesSeleccionados = personDTO.getRoles()
                .stream()
                .map(r -> r.getName().name().toLowerCase())
                .collect(Collectors.toList()); // Obtenemos los roles como una lista de cadenas
    
        // Llamada al servicio de Keycloak para crear el usuario
        keycloakService.createUser(
                finalUsername,
                personDTO.getEmail(),
                personDTO.getDocument(), // El documento de la persona es la contraseña
                rolesSeleccionados);

        //String email = personDTO.getEmail();
        //String username = finalUsername;
        //String password = personDTO.getDocument();
        //emailService.sendCredentialsEmail(email, username, password);
        // Devolvemos el DTO de la persona recién creada
        return PersonMapper.INSTANCE.mapPersonToPersonDTO(personSaved);
    }
    

    public PersonDTO getAccountInfoByEmail(String email) {
        Optional<Person> personOpt = personRepo.findByEmail(email);
        Person personInfo = null;
        if (personOpt.isPresent())
            personInfo = personOpt.get();
        else
            personInfo = new Person();
        return PersonMapper.INSTANCE.mapPersonToPersonDTO(personInfo);
    }

    public PersonDTO getAccountInfoByUsername(String username) {
        Optional<Login> loginOpt = loginRepo.findByUserName(username);
        Person personInfo = loginOpt.map(Login::getPerson).orElseGet(Person::new);
        return PersonMapper.INSTANCE.mapPersonToPersonDTO(personInfo);
    }

    public PersonDTO ModifyAccountInfo(PersonDTO personDTO, String username) {

        Optional<Login> personOpt = loginRepo.findByUserName(username);
        Person person = personOpt.map(Login::getPerson).orElseGet(Person::new);
        if (personOpt.isPresent()) {

            person.setFirstName(personDTO.getFirstName());
            person.setLastName(personDTO.getLastName());
            Person.DocumentType documentType = Person.DocumentType.valueOf(personDTO.getDocumentType().toUpperCase());
            person.setDocumentType(documentType);
            person.setDocument(personDTO.getDocument());
            person.setPhone(personDTO.getPhone());
            person.setBirthDate(personDTO.getBirthDate());

            if (personDTO.getLocation() != null) {
                Location location = LocationMapper.INSTANCE.mapLocationDTOToLocation(personDTO.getLocation());
                if (location.getIdLocation() == null) {
                    location = locationRepo.save(location);
                }
                person.setLocation(location);
            }
        }
        Person updatedPerson = personRepo.save(person);
        return PersonMapper.INSTANCE.mapPersonToPersonDTO(updatedPerson);
    }

    public List<PersonDTO> getPersonsByRole(RoleName roleName) {
        List<PersonRole> personRoles = personRoleRepo.findByRoleName(roleName);
        return personRoles.stream()
                .map(pr -> PersonMapper.INSTANCE.mapPersonToPersonDTO(pr.getPerson()))
                .collect(Collectors.toList());
    }

    public List<PersonDTO> getStudents() {
        return getPersonsByRole(RoleName.STUDENT);
    }

    public List<PersonDTO> getAdmins() {
        return getPersonsByRole(RoleName.ADMIN);
    }

    public List<PersonDTO> getTeachers() {
        return getPersonsByRole(RoleName.TEACHER);
    }

    @Override
    protected Person toEntity(PersonDTO dto) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'toEntity'");
    }

    @Override
    protected PersonDTO toDTO(Person entity) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'toDTO'");
    }

    public List<PersonDTO> getAllPersons() {
        List<Person> persons = personRepo.findAll();
    
        return persons.stream().map(person -> {
            PersonDTO dto = PersonMapper.INSTANCE.mapPersonToPersonDTO(person);
    
            if (person.getLocation() != null) {
                Location location = person.getLocation();
    
                // Obtener departamento como parent del location
                LocationDTO parentDTO = null;
                if (location.getParent() != null) {
                    parentDTO = new LocationDTO(
                        location.getParent().getIdLocation(),
                        location.getParent().getLocationName(),
                        null // El parent del departamento lo dejamos null para evitar recursividad infinita
                    );
                }
    
                LocationDTO locationDTO = new LocationDTO(
                    location.getIdLocation(),
                    location.getLocationName(),
                    parentDTO
                );
    
                dto.setLocation(locationDTO);
            }
    
            List<PersonRole> roles = personRoleRepo.findByPersonId(person.getPersonId());
            List<RoleDTO> roleDTOs = roles.stream()
                .map(pr -> new RoleDTO(pr.getRole().getRole_id(), pr.getRole().getName()))
                .collect(Collectors.toList());
    
            dto.setRoles(roleDTOs);
    
            return dto;
        }).collect(Collectors.toList());
    }
    
    @Transactional
    public void deletePersonById(int personId) {
        Person person = personRepo.findById(personId)
                .orElseThrow(() -> new RuntimeException("Persona no encontrada con ID: " + personId));

        // Obtener username (puede no existir)
        String username = loginRepo.findByPerson(person)
                .map(Login::getUserName)
                .orElse(null);
         // Eliminar en Keycloak si existe username
         if (username != null) {
            keycloakService.deleteUserByUsername(username);
        }
        // Eliminar grupos si existen
        if (groupPersonRepo.existsByPerson_id_PersonId(personId)) {
            groupPersonRepo.deleteByPersonId(personId);
        }

        // Eliminar roles si existen
        if (!personRoleRepo.findByPersonId(personId).isEmpty()) {
            personRoleRepo.deleteByPersonId(personId);
        }

        // Eliminar certificados si existen
        List<Integer> certIds = certificateRepo.findByPerson_PersonId(personId)
                .stream()
                .map(Certificate::getCertificateId)
                .collect(Collectors.toList());

        if (!certIds.isEmpty()) {
            certificateLevelRepo.deleteByCertificateIdIn(certIds);
            certificateCodeRepo.deleteByCertificateIdIn(certIds);
            certificateRepo.deleteByPersonId(personId);
        }

        // Eliminar login si existe
        if (loginRepo.existsByPerson(person)) {
            loginRepo.deleteByPerson(person);
        }

        // Finalmente eliminar persona
        personRepo.delete(person);
    }

    public Person getPersonByUserName(String username) {
        return loginRepo.findByUserName(username)
                .map(Login::getPerson)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
    }

    public Person getPersonByDocument(String document) {
        return personRepo.findByDocument(document)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + document));
    }

    public Person getPersonById(Integer id) {
        return personRepo.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + id));
    }

}
