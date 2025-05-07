package com.uptc.idiomas.certigest.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.uptc.idiomas.certigest.dto.PersonDTO;
import com.uptc.idiomas.certigest.dto.RoleDTO;
import com.uptc.idiomas.certigest.entity.Location;
import com.uptc.idiomas.certigest.entity.Login;
import com.uptc.idiomas.certigest.entity.Person;
import com.uptc.idiomas.certigest.entity.PersonRole;
import com.uptc.idiomas.certigest.entity.Role;
import com.uptc.idiomas.certigest.entity.Role.RoleName;
import com.uptc.idiomas.certigest.mapper.LocationMapper;
import com.uptc.idiomas.certigest.mapper.PersonMapper;
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

    @Override
    protected JpaRepository<Person, Integer> getRepo() {
        return personRepo;
    }

    public PersonDTO addPersonInDb(PersonDTO personDTO) {
        Location location = null;

        if (personDTO.getLocation() != null && personDTO.getLocation().getIdLocation() != null) {
            location = locationRepo.findById(personDTO.getLocation().getIdLocation())
                    .orElse(null);
        }

        Person person = PersonMapper.INSTANCE.mapPersonDTOToPerson(personDTO);
        person.setLocation(location);
        Person personSaved = personRepo.save(person);

        // Crear el usuario en Login
        String[] nameParts = personDTO.getFirstName().trim().split("\\s+");
        String[] lastNameParts = personDTO.getLastName().trim().split("\\s+");
        String baseUsername = nameParts[0].toLowerCase() + lastNameParts[0].toLowerCase();
        int count = 1;
        String finalUsername;
        do {
            finalUsername = baseUsername + count;
            count++;
        } while (loginRepo.existsByUserName(finalUsername));

        Login login = new Login();
        login.setUserName(finalUsername);
        login.setPerson(personSaved);
        loginRepo.save(login);

        // Asociar los roles recibidos
        if (personDTO.getRoles() != null) {
            for (RoleDTO roleDTO : personDTO.getRoles()) {
                RoleName roleName = roleDTO.getName(); 
                Role role = roleRepo.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + roleName));

                PersonRole personRole = new PersonRole();
                personRole.setPerson(personSaved);
                personRole.setRole(role);
                personRoleRepo.save(personRole);
            }
        }

        // Crear usuario en Keycloak
        List<String> rolesSeleccionados = personDTO.getRoles()
                .stream()
                .map(r -> r.getName().name().toLowerCase())
                .toList();

        keycloakService.createUser(
                finalUsername,
                personDTO.getEmail(),
                personDTO.getDocument(), // contraseña
                rolesSeleccionados);

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
    
            //  Obtener los roles asociados usando el ID de la persona
            List<PersonRole> roles = personRoleRepo.findByPersonId(person.getPersonId());
    
            //  Convertir a RoleDTO
            List<RoleDTO> roleDTOs = roles.stream()
               .map(pr -> new RoleDTO(pr.getRole().getRole_id(), pr.getRole().getName()))
                .collect(Collectors.toList());
    
            dto.setRoles(roleDTOs);
            return dto;
        }).collect(Collectors.toList());
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
}
