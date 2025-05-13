package com.uptc.idiomas.certigest.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import com.uptc.idiomas.certigest.dto.CertificateHistoryDTO;
import com.uptc.idiomas.certigest.dto.CourseDTO;
import com.uptc.idiomas.certigest.entity.*;
import com.uptc.idiomas.certigest.repo.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class CertificateServiceTest {

    @InjectMocks
    private CertificateService service;

    @Mock private CertificateRepo certificateRepo;
    @Mock private CertificateCodeRepo certificateCodeRepo;
    @Mock private CertificateLevelRepo certificateLevelRepo;
    @Mock private PersonService personService;
    @Mock private CourseService courseService;
    @Mock private LevelService levelService;
    @Mock private GroupService groupService;

    private Person dummyPerson;
    private Level dummyLevel;
    private GroupPerson dummyGroupPerson;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Persona de prueba
        dummyPerson = new Person();
        dummyPerson.setPersonId(1);
        dummyPerson.setFirstName("Juan");
        dummyPerson.setLastName("Pérez");
        dummyPerson.setDocument("1234");

        // Curso y nivel de prueba
        Course course = new Course();
        course.setCourse_name("Ingles");
        course.setCourse_description("Curso de Inglés");
        dummyLevel = new Level();
        dummyLevel.setLevel_id(10);
        dummyLevel.setLevel_name("A1");
        dummyLevel.setId_course(course);

        // Grupo-persona de prueba con fecha pasada y calificación aprobatoria
        dummyGroupPerson = new GroupPerson();
        dummyGroupPerson.setGroup_id(new GroupInst());
        dummyGroupPerson.getGroup_id().setLevel_id(dummyLevel);
        // fecha de fin ayer
        dummyGroupPerson.setEnd_date(Date.from(LocalDate.now().minusDays(1)
                .atStartOfDay(ZoneId.systemDefault()).toInstant()));
        dummyGroupPerson.setCalification(Float.parseFloat("4.7"));
        dummyGroupPerson.setLevel_duration("40");
    }

    @Test
    void normalizeText_shouldRemoveDiacritics() {
        String input = "ÁéÍóÚñÇü";
        String expected = "AeIoUnCu";
        assertEquals(expected, service.normalizeText(input));
    }

    @Test
    void generateLevelCertificateCode_basicType_createsAndReturnsCode() {
        when(personService.getPersonByUserName("juan")).thenReturn(dummyPerson);
        when(levelService.findByLevelId(10)).thenReturn(dummyLevel);
        when(groupService.getGroupByPersonAndLevel(1, 10)).thenReturn(dummyGroupPerson);
        when(certificateCodeRepo.existsByCode(anyString())).thenReturn(false);
        // capturamos la llamada a save en certificateRepo
        when(certificateRepo.save(any())).thenAnswer(inv -> {
            Certificate c = inv.getArgument(0);
            c.setCertificateId(100);
            return c;
        });

        String code = service.generateLevelCertificateCode("juan", "basic", 10);

        assertTrue(code.startsWith("CERT_"));                   // formato correcto
        verify(certificateRepo, times(1)).save(any(Certificate.class));
        verify(certificateCodeRepo, times(1)).save(any(CertificateCode.class));
        verify(certificateLevelRepo, times(1)).save(any(CertificateLevel.class));
    }

    @Test
    void generateLevelCertificateCode_abilitiesType_normalizesCorrectly() {
        when(personService.getPersonByUserName("juan")).thenReturn(dummyPerson);
        when(levelService.findByLevelId(10)).thenReturn(dummyLevel);
        when(groupService.getGroupByPersonAndLevel(1, 10)).thenReturn(dummyGroupPerson);
        when(certificateCodeRepo.existsByCode(anyString())).thenReturn(false);

        String code = service.generateLevelCertificateCode("juan", "ABILITIES", 10);

        assertTrue(code.contains("ABILITIES_1234_Ingles_A1"));
        verify(certificateRepo).save(any());
    }

    @Test
    void generateAllLevelsCertificateAndSave_withApprovedLevels_savesAndReturnsCode() {
        CourseDTO courseDTO = new CourseDTO();
        courseDTO.setCourse_name("Ingles");
        courseDTO.setId_course(5);

        Course courseEntity = new Course();
        courseEntity.setCourse_name("Ingles");

        when(personService.getPersonByUserName("juan")).thenReturn(dummyPerson);
        when(courseService.findById(5)).thenReturn(courseDTO);
        when(courseService.toEntity(courseDTO)).thenReturn(courseEntity); // Mock válido
        when(groupService.getGroupByPerson(1)).thenReturn(Collections.singletonList(dummyGroupPerson));
        when(certificateCodeRepo.existsByCode(anyString())).thenReturn(false);
        when(certificateRepo.save(any())).thenAnswer(inv -> {
            Certificate c = inv.getArgument(0);
            c.setCertificateId(200);
            return c;
        });

        String code = service.generateAllLevelsCertificateAndSave("juan", 5);

        assertTrue(code.startsWith("CERT_ALL_LEVEL_1234"));
        verify(certificateCodeRepo).save(any(CertificateCode.class));
        verify(certificateLevelRepo, times(1)).save(any(CertificateLevel.class));
    }

    @Test
    void getCertificateHistory_returnsHistoryDTOs() {
        // Prepara persona y certificados
        when(personService.getPersonByUserName("juan")).thenReturn(dummyPerson);
        Certificate cert = new Certificate();
        cert.setCertificateId(300);
        cert.setPerson(dummyPerson);
        cert.setGenerationDate(new Date());
        cert.setCertificateType(Certificate.CertificateType.BASIC);
        when(certificateRepo.findByPerson_PersonId(1)).thenReturn(Arrays.asList(cert));

        // Código y levels
        when(certificateCodeRepo.findByCertificateId(300)).thenReturn(new CertificateCode() {{
            setCode("C123");
            setCertificate(cert);
        }});
        when(certificateLevelRepo.findByCertificate_CertificateId(300))
            .thenReturn(Collections.singletonList(new CertificateLevel() {{
                setLevel(dummyLevel);
            }}));

        List<CertificateHistoryDTO> history = service.getCertificateHistory("juan");
        assertEquals(1, history.size());
        CertificateHistoryDTO dto = history.get(0);
        assertEquals("Ingles", dto.getCourseName());
        assertEquals("A1", dto.getLevelName());
        assertEquals("Juan Pérez", dto.getFullName());
        assertEquals("1234", dto.getPersonId());
        assertEquals("C123", dto.getCode());
    }
}

