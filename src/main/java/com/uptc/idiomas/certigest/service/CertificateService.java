package com.uptc.idiomas.certigest.service;

import java.net.URL;
import java.text.Normalizer;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.itextpdf.barcodes.BarcodeQRCode;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.xobject.PdfFormXObject;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import com.uptc.idiomas.certigest.dto.CertificateDTO;
import com.uptc.idiomas.certigest.dto.CertificateHistoryDTO;
import com.uptc.idiomas.certigest.entity.Certificate;
import com.uptc.idiomas.certigest.entity.CertificateCode;
import com.uptc.idiomas.certigest.entity.CertificateLevel;
import com.uptc.idiomas.certigest.entity.Course;
import com.uptc.idiomas.certigest.entity.GroupPerson;
import com.uptc.idiomas.certigest.entity.Level;
import com.uptc.idiomas.certigest.entity.Person;
import com.uptc.idiomas.certigest.mapper.CertificateMapper;
import com.uptc.idiomas.certigest.repo.CertificateCodeRepo;
import com.uptc.idiomas.certigest.repo.CertificateLevelRepo;
import com.uptc.idiomas.certigest.repo.CertificateRepo;

@Service
public class CertificateService extends BasicServiceImpl<CertificateDTO, Certificate, Integer>{
    
    @Autowired
    private CertificateRepo certificateRepo;
    @Autowired
    private CertificateCodeRepo certificateCodeRepo;
    @Autowired
    private CertificateLevelRepo certificateLevelRepo;
    @Autowired
    private PersonService personService;
    @Autowired
    private CourseService courseService;
    @Autowired
    private LevelService levelService;
    @Autowired
    private GroupService groupService;

    private final CertificateMapper mapper = CertificateMapper.INSTANCE;
    
    @Override
    protected JpaRepository<Certificate, Integer> getRepo() {
        return certificateRepo;
    }

    @Override
    protected Certificate toEntity(CertificateDTO dto) {
        return mapper.mapCertificateDTOToCertificate(dto);
    }

    @Override
    protected CertificateDTO toDTO(Certificate entity) {
        return mapper.mapCertificateToCertificateDTO(entity);
    }

    private byte[] generatePDF(String content, Date generationDate, String certificateCode) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.LETTER.rotate());

            // Márgenes para ajustar mejor el contenido verticalmente
            document.setMargins(130, 80, 100, 80); // ↑ Aumentamos el margen superior

            // Página y fondo
            PdfPage page = pdf.addNewPage();
            URL bgUrl = getClass().getResource("/static/images/Certificado-pica (1).png");
            ImageData bg = ImageDataFactory.create(bgUrl);
            PdfCanvas canvas = new PdfCanvas(page);
            canvas.addImageFittedIntoRectangle(bg, page.getPageSize(), false);

            // Espacio opcional superior (para no pegar el título al borde)
            document.add(new Paragraph("\n"));

            // Título
            Paragraph titulo = new Paragraph("UNIVERSIDAD PEDAGÓGICA Y TECNOLÓGICA DE COLOMBIA\nINSTITUTO INTERNACIONAL DE IDIOMAS")
                .setBold()
                .setFontSize(16)
                .setTextAlignment(TextAlignment.CENTER);
            document.add(titulo);

            //Codigo certificado
            Paragraph codigoCertificado = new Paragraph(certificateCode)
                .setFontSize(9)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.DARK_GRAY);
            document.add(codigoCertificado);

            // Espacio
            document.add(new Paragraph("\n\n"));

            // Contenido del certificado, centrado
            Paragraph cuerpo = new Paragraph(content)
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER);
            document.add(cuerpo);

            // Contenido de ciudad y fecha
            String fechaFormateada = formatearFechaEstiloCertificado(generationDate);
            Paragraph fecha = new Paragraph(fechaFormateada)
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER);
            document.add(fecha);


            // Espacio para separación antes de firma
            document.add(new Paragraph("\n\n\n\n\n"));

            // Firma
            Paragraph firma = new Paragraph("__________________________\nCoordinador Instituto de Idiomas")
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER);
            document.add(firma);

            //AGREGAR QR -- CAmbiar cuando este desplegado "https://certigestdev.click/certificate/validateCertificate/" + certificateCode;
            String qrContent = "http://localhost:8080/certificate/validateCertificate/" + certificateCode;

            BarcodeQRCode qrCode = new BarcodeQRCode(qrContent);
            PdfFormXObject qrObject = qrCode.createFormXObject(ColorConstants.BLACK, pdf);
            Image qrImage = new Image(qrObject).scaleAbsolute(80, 80);

            float x = pdf.getDefaultPageSize().getWidth() - 100;
            float y = 40;
            qrImage.setFixedPosition(x, y);
            document.add(qrImage);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el PDF", e);
        }
    }

    private String formatearFechaEstiloCertificado(Date fecha) {
        SimpleDateFormat formatoDia = new SimpleDateFormat("d");
        SimpleDateFormat formatoMes = new SimpleDateFormat("MMMM");
        SimpleDateFormat formatoAnio = new SimpleDateFormat("yyyy");

        String dia = formatoDia.format(fecha);
        String mes = formatoMes.format(fecha);
        String anio = formatoAnio.format(fecha);

        return String.format("Tunja, Colombia, %s de %s del año %s", dia, mes, anio);
    }

    private String generateLevelCertificateText(Person person, String certificateType, LocalDate endDate, Level level, GroupPerson groupPerson) {
        StringBuilder sb = new StringBuilder(generateTitle(person));
        if (certificateType.equalsIgnoreCase("basic")) {
            if(endDate.isAfter(LocalDate.now())){
                sb.append(", actualmente se encuentra matriculado(a) y esta cursando el idioma Extranjero ");
            } else{
                if (groupPerson.getCalification() >= 3.0) {
                    sb.append(", curso y aprobo el nivel del programa en idioma Extranjero ");
                } else {
                    return("No se puede generar un certificado si no se aprobó el curso");
                }
            }
            sb.append(generateBodyOfBasicCertificate(level, groupPerson));
        } else if (certificateType.equalsIgnoreCase("notes")){
            if (groupPerson.getCalification() == null) {
                return "No se puede generar un certificado de notas si el docente no ha subido notas";
            }
            if (groupPerson.getCalification() >= 3.0) {
                if (endDate.isBefore(LocalDate.now())) {
                    sb.append(generateBodyOfNotesCertificate(level, groupPerson));
                } else {
                    return "No se puede generar un certificado de notas si no se ha culminado el curso";
                }
            } else {
                return "No se puede generar un certificado de notas si no se aprobó el curso";
            }
        } else {
            return "No se pudo generar el certificado. Ha ocurrido un error.";
        }
        return sb.toString();
    }

    private String generateBodyOfBasicCertificate(Level level, GroupPerson groupPerson) {
        return level.getId_course().getCourse_name() + " " + level.getLevel_name() + " con una intensidad de " 
                + groupPerson.getLevel_duration() + " horas.";
    }

    private String generateBodyOfNotesCertificate(Level level, GroupPerson groupPerson) {
        return ", curso y aprobo el nivel del programa en idioma Extranjero " + level.getId_course().getCourse_name() + 
                        " " + level.getLevel_name() + " con una nota de " + groupPerson.getCalification() + " y con una intensidad de " + 
                        groupPerson.getLevel_duration() + " horas.";
    }

    private String generateTitle(Person person) {
        return "Informa que, " + person.getFirstName() + " " + person.getLastName() + ", identificado con "
                    + person.getDocumentType() + " " + person.getDocument();
    }

    private String generateCode(LocalDate endDate, String certificateType, Person person, Level level) {
        String stage = endDate.isAfter(LocalDate.now()) ? "MATRICULA" : "APROBACION"; 
        return "CERT_" + stage + "_" + certificateType.toUpperCase() + "_" + person.getDocument() + "_" +
                level.getId_course().getCourse_name().replaceAll("\s+", "") + "_" +
                level.getLevel_name().replaceAll("\s+", "");
    }
    
    public String normalizeText(String input) {
        return Normalizer.normalize(input, Normalizer.Form.NFD)
                        .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    }
    private void saveLevelCertificateInDB(Person person, String certificateType, Level level, String code) {
        Certificate certificate = new Certificate();
        certificate.setPerson(person);
        certificate.setCertificateType(Certificate.CertificateType.valueOf(certificateType.toUpperCase()));
        certificate.setGenerationDate(new Date());
        certificate = certificateRepo.save(certificate);

        CertificateCode certificateCode = new CertificateCode();
        certificateCode.setCertificate(certificate);
        certificateCode.setCode(code);
        certificateCodeRepo.save(certificateCode);

        CertificateLevel certificateLevel = new CertificateLevel();
        certificateLevel.setCertificate(certificate);
        certificateLevel.setLevel(level);
        certificateLevelRepo.save(certificateLevel);
    }

    public List<CertificateHistoryDTO> getCertificateHistory(String username) {
        Person person = personService.getPersonByUserName(username);
        List<Certificate> personCertificates = certificateRepo.findByPerson_PersonId(person.getPersonId());
        List<CertificateHistoryDTO> personCertificateHistory = new ArrayList<>();

        for (Certificate certificate : personCertificates) {
            personCertificateHistory.add(generateCertificateHistoryDTO(person.getFirstName(), certificate));
        } 

        return personCertificateHistory;
    }

    private CertificateHistoryDTO generateCertificateHistoryDTO(String username, Certificate certificate) {
        CertificateCode cerCode = certificateCodeRepo.findByCertificateId(certificate.getCertificateId());
        String fullName = certificate.getPerson().getFirstName() + " " + certificate.getPerson().getLastName();
        String code = cerCode.getCode();
        Date generationDate = certificate.getGenerationDate();
        String certificateType = certificate.getCertificateType().name();
        String personId = certificate.getPerson().getDocument();
        String levelName = "";
        String courseName = "";
    
        List<CertificateLevel> certificateLevels = certificateLevelRepo.findByCertificate_CertificateId(certificate.getCertificateId());
    
        if (certificateLevels == null || certificateLevels.isEmpty()) {
            levelName = "Sin niveles registrados";
            courseName = "Desconocido";
        } else if (certificateType.equalsIgnoreCase("ALL_LEVEL")) {
            StringBuilder levelBuilder = new StringBuilder();
            for (CertificateLevel cl : certificateLevels) {
                levelBuilder.append(cl.getLevel().getLevel_name()).append(", ");
                if (courseName.isEmpty()) {
                    courseName = cl.getLevel().getId_course().getCourse_name();
                }
            }
            levelName = levelBuilder.toString().replaceAll(", $", "");
        } else {
            CertificateLevel cl = certificateLevels.get(0);
            levelName = cl.getLevel().getLevel_name();
            courseName = cl.getLevel().getId_course().getCourse_name();
        }
    
        return new CertificateHistoryDTO(courseName, levelName, fullName, personId, generationDate, certificateType, code);
    }
    

    public List<CertificateHistoryDTO> findAllHistory() {
        List<CertificateHistoryDTO> certificateHistory = new ArrayList<>();
        for (Certificate certificate : certificateRepo.findAll()) {
            certificateHistory.add(generateCertificateHistoryDTO(certificate.getPerson().getFirstName(), certificate));
        }
        return certificateHistory;
    }

    public byte[] validateCertificatePdf(String id) {
        CertificateCode certificateCode = certificateCodeRepo.findByCode(id);
        if (certificateCode == null) {
            throw new RuntimeException("No existe el certificado.");
        }
    
        Certificate certificate = certificateCode.getCertificate();
        Person person = certificate.getPerson();
        String certificateType = certificate.getCertificateType().name();
    
        List<CertificateLevel> levels = certificateLevelRepo.findByCertificate_CertificateId(certificate.getCertificateId());
        if (levels.isEmpty()) {
            throw new RuntimeException("No tiene niveles asociados este certificado");
        }
    
        if (certificateType.equalsIgnoreCase("ALL_LEVEL")) {
            String courseName = levels.get(0).getLevel().getId_course().getCourse_name();
            String output = generateAllLevelsCertificateText(person, courseName);
            return generatePDF(output, certificate.getGenerationDate(), certificateCode.getCode());
        }

        Level level = levels.get(0).getLevel();
        GroupPerson groupPerson = groupService.getGroupByPersonAndLevel(person.getPersonId(), level.getLevel_id());
        if (groupPerson == null) {
            throw new RuntimeException("No se encontró la relación entre la persona y el nivel del certificado.");
        }
        LocalDate endDate = groupPerson.getEnd_date().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

        if (certificateType.equalsIgnoreCase("ABILITIES")) {
            String courseName = levels.get(0).getLevel().getId_course().getCourse_name();
            String courseDescription = levels.get(0).getLevel().getId_course().getCourse_description();
            String output = generateAbilitiesCertificateText(person, courseName, courseDescription, level.getLevel_name());
            return generatePDF(output, certificate.getGenerationDate(), certificateCode.getCode());
        }
        
        String output = generateLevelCertificateText(person, certificateType, endDate, level, groupPerson);
        return generatePDF(output, certificate.getGenerationDate(), certificateCode.getCode());
    }

    private List<Level> getApprovebLevels(List<GroupPerson> groupsPerson, String courseName) {
        List<Level> approvedLevels = new ArrayList<>();
        for (GroupPerson gp : groupsPerson) {
            Level level = gp.getGroup_id().getLevel_id();
            Course course = level.getId_course();
            if (course.getCourse_name().equalsIgnoreCase(courseName)) {
                LocalDate endDate = gp.getEnd_date().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                if (endDate.isBefore(LocalDate.now())) {
                    if (gp.getCalification() >= 3.0) {
                        approvedLevels.add(level);
                    }
                }
            }
        }
        return approvedLevels;
    }

    public String generateAllLevelsCertificateText(Person personUsername, String courseName) {
        Person person = personUsername;
        List<GroupPerson> groupsPerson = groupService.getGroupByPerson(person.getPersonId());
        boolean hasMatchingCourse = false;
        boolean hasFinishedCourse = false;
        boolean hasApprovedCourse = false;
    
        List<String> approvedLevels = new ArrayList<>();
        int hours = 0;
        
        for (GroupPerson gp : groupsPerson) {
            Level level = gp.getGroup_id().getLevel_id();
            Course course = level.getId_course();
            if (course.getCourse_name().equalsIgnoreCase(courseName)) {
                hasMatchingCourse = true;
    
                LocalDate endDate = gp.getEnd_date().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                if (endDate.isBefore(LocalDate.now())) {
                    hasFinishedCourse = true;
    
                    if (gp.getCalification() >= 3.0) {
                        hasApprovedCourse = true;
                        approvedLevels.add(level.getLevel_name());
                        hours += Integer.parseInt(gp.getLevel_duration());
                    }
                }
            }
        }
    
        if (!hasMatchingCourse)
            return "No se generó el certificado, porque el usuario no tiene ningún curso asociado con el nombre proporcionado.";
        if (!hasFinishedCourse) 
            return "No se generó el certificado, porque el usuario no ha finalizado ningún curso asociado.";
        if (!hasApprovedCourse)
            return "No se generó el certificado, porque el usuario debe aprobar al menos un nivel del curso para generar el certificado.";
        
        return buildCertificateText(person, courseName, approvedLevels, hours);
    }
    
    private String buildCertificateText(Person person, String courseName, List<String> approvedLevels, int hours) {
        StringBuilder sb = new StringBuilder();
        sb.append(generateTitle(person));
        sb.append(", cursó y aprobó el curso de idioma Extranjero ").append(courseName);
        sb.append(approvedLevels.size() > 1 ? " en los niveles " : " en el nivel ");
        sb.append(String.join(", ", approvedLevels));
        sb.append(" con una intensidad total de ").append(hours).append(" horas.");
        return sb.toString();
    }

    private void saveAllCertificateInDB(Person person, String certificateType, String code, List<Level> aprobedLevels) {
        Certificate certificate = new Certificate();
        certificate.setPerson(person);
        certificate.setCertificateType(Certificate.CertificateType.valueOf(certificateType.toUpperCase()));
        certificate.setGenerationDate(new Date());
        certificate = certificateRepo.save(certificate);

        CertificateCode certificateCode = new CertificateCode();
        certificateCode.setCertificate(certificate);
        certificateCode.setCode(code);
        certificateCodeRepo.save(certificateCode);

        for (Level l : aprobedLevels) {
            CertificateLevel certificateLevel = new CertificateLevel();
            certificateLevel.setCertificate(certificate);
            certificateLevel.setLevel(l);
            certificateLevelRepo.save(certificateLevel);
        }
    }

    public String generateLevelCertificateCode(String username, String certificateType, Integer levelId) {
        Person person = personService.getPersonByUserName(username);
        Level  level  = levelService.findByLevelId(levelId);
        GroupPerson gp= groupService.getGroupByPersonAndLevel(person.getPersonId(), level.getLevel_id());
        LocalDate end = gp.getEnd_date().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        String code = "";

        if (certificateType.equalsIgnoreCase("ABILITIES")) {
            code = normalizeText("CERT_" + certificateType.toUpperCase() + "_" + person.getDocument() + "_" +
                level.getId_course().getCourse_name().replaceAll("\s+", "") + "_" +
                level.getLevel_name().replaceAll("\s+", ""));
        } else {
            code = normalizeText(generateCode(end, certificateType, person, level));
        }
        // Si no existe, guarda en BD
        if (!certificateCodeRepo.existsByCode(code)) {
            saveLevelCertificateInDB(person, certificateType, level, code);
        }
        return code;
    }

    public String generateAllLevelsCertificateAndSave(String username, Integer courseId) {
        Person person = personService.getPersonByUserName(username);
        Course course = courseService.toEntity(courseService.findById(courseId));
        String code = normalizeText("CERT_ALL_LEVEL_" + person.getDocument() + "_" + course.getCourse_name().replaceAll("\\s+", ""));
        List<GroupPerson> groupsPerson = groupService.getGroupByPerson(person.getPersonId());
        List<Level> approvedLevels = getApprovebLevels(groupsPerson, course.getCourse_name());

        String output = generateAllLevelsCertificateText(person, course.getCourse_name());

        if (output.toLowerCase().startsWith("no")) {
            throw new RuntimeException(output);
        }

        if (!certificateCodeRepo.existsByCode(code)) {
            saveAllCertificateInDB(person, "ALL_LEVEL", code, approvedLevels);
        }

        return code;
    }
    private String generateAbilitiesCertificateText(Person person, String courseName, String courseDescription, String levelName) {
        return String.format(
            "Informa que, %s %s, identificado con %s %s presentó el examen de suficiencia en idioma extranjero - %s %s, obteniendo nivel (%s), según el Marco Común de Referencia Europeo - CEFR.",
            person.getFirstName(),
            person.getLastName(),
            person.getDocumentType(),
            person.getDocument(),
            courseName,
            courseDescription,
            levelName
        );
    }
}
