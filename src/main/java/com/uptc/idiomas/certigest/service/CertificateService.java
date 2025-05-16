package com.uptc.idiomas.certigest.service;

import java.net.URL;
import java.text.Normalizer;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

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
public class CertificateService extends BasicServiceImpl<CertificateDTO, Certificate, Integer> {

    // -------------------- Repositories & Services --------------------
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

    // -------------------- Mapper --------------------
    private final CertificateMapper mapper = CertificateMapper.INSTANCE;

    // -------------------- Overrides --------------------
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

    // -------------------- Public API --------------------

    /** Genera y/o retorna el código de un certificado de nivel específico */
    public String generateLevelCertificateCode(String username, String certificateType, Integer levelId) {
        Person person = personService.getPersonByUserName(username);
        Level level = levelService.findByLevelId(levelId);
        GroupPerson gp = groupService.getGroupByPersonAndLevel(person.getPersonId(), level.getLevel_id());
        LocalDate end = gp.getEnd_date().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

        validateLevelCertificate(person, certificateType, end, level, gp);

        String code;
        if (certificateType.equalsIgnoreCase("ABILITIES")) {
            code = normalizeText("CERT_" + certificateType.toUpperCase() + "_" + person.getDocument()
                    + "_" + level.getId_course().getCourse_name().replaceAll("\\s+", "")
                    + "_" + level.getLevel_name().replaceAll("\\s+", ""));
        } else {
            code = normalizeText(generateCode(end, certificateType, person, level));
        }

        if (!certificateCodeRepo.existsByCode(code)) {
            saveLevelCertificateInDB(person, certificateType, level, code);
        }
        return code;
    }

    public String generateLevelCertificateCodeAdmin(String personDocument, String certificateType, Integer levelId) {
        Person person = personService.getPersonByDocument(personDocument);
        Level level = levelService.findByLevelId(levelId);
        GroupPerson gp = groupService.getGroupByPersonAndLevel(person.getPersonId(), level.getLevel_id());
        LocalDate end = gp.getEnd_date().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

        validateLevelCertificate(person, certificateType, end, level, gp);

        String code;
        if (certificateType.equalsIgnoreCase("ABILITIES")) {
            code = normalizeText("CERT_" + certificateType.toUpperCase() + "_" + person.getDocument()
                    + "_" + level.getId_course().getCourse_name().replaceAll("\\s+", "")
                    + "_" + level.getLevel_name().replaceAll("\\s+", ""));
        } else {
            code = normalizeText(generateCode(end, certificateType, person, level));
        }

        if (!certificateCodeRepo.existsByCode(code)) {
            saveLevelCertificateInDB(person, certificateType, level, code);
        }
        return code;
    }

    private void validateLevelCertificate(Person person, String type, LocalDate endDate, Level level, GroupPerson gp) {
        Float calification = gp.getCalification();
        String tipo = type.equalsIgnoreCase("abilities") ? "habilidades"
                : type.equalsIgnoreCase("notes") ? "notas"
                        : type.equalsIgnoreCase("basic") ? "básico"
                                : type;

        if (type.equalsIgnoreCase("basic")) {
            if (!endDate.isAfter(LocalDate.now())) {
                if (calification == null) {
                    throw new RuntimeException(
                            "No se puede generar el certificado porque no se ha calificado el curso.");
                } else if (calification < 3.0) {
                    throw new RuntimeException("No se puede generar el certificado porque no se aprobó el curso.");
                }
            }
        } else if (type.equalsIgnoreCase("notes") || type.equalsIgnoreCase("ABILITIES")) {
            if (calification == null) {
                throw new RuntimeException(
                        "No se puede generar un certificado de " + tipo + " si el docente no ha subido notas.");
            } else if (calification < 3.0) {
                throw new RuntimeException(
                        "No se puede generar un certificado de " + tipo + " si no se aprobó el curso.");
            } else if (endDate.isAfter(LocalDate.now())) {
                throw new RuntimeException(
                        "No se puede generar un certificado de " + tipo + " si no se ha culminado el curso.");
            }
        } else if (!type.equalsIgnoreCase("ABILITIES")) {
            throw new RuntimeException(
                    "No se pudo generar el certificado. Ha ocurrido un error con el tipo de certificado.");
        }
    }

    /** Genera y guarda código de certificado para todos los niveles de un curso */
    public String generateAllLevelsCertificateAndSave(String username, Integer courseId) {
        Person person = personService.getPersonByUserName(username);
        Course course = courseService.toEntity(courseService.findById(courseId));

        List<GroupPerson> groupsPerson = groupService.getGroupByPerson(person.getPersonId());
        List<Level> approvedLevels = getApprovebLevels(groupsPerson, course.getCourse_name());
        String output = generateAllLevelsCertificateText(person, course.getCourse_name());
        String levelsPart = approvedLevels.stream()
                .map(level -> level.getLevel_name().replaceAll("\\s+", ""))
                .collect(Collectors.joining("_"));
        String code = normalizeText("CERT_ALL_LEVEL_" + person.getDocument()
                + "_" + course.getCourse_name().replaceAll("\\s+", "") + "_" + levelsPart);

        if (output.toLowerCase().startsWith("no")) {
            throw new RuntimeException(output);
        }

        if (!certificateCodeRepo.existsByCode(code)) {
            saveAllCertificateInDB(person, "ALL_LEVEL", code, approvedLevels);
        }
        return code;
    }

    public String generateAllLevelsCertificateAndSaveAdmin(String personDocument, Integer courseId) {
        Person person = personService.getPersonByDocument(personDocument);
        Course course = courseService.toEntity(courseService.findById(courseId));

        List<GroupPerson> groupsPerson = groupService.getGroupByPerson(person.getPersonId());
        List<Level> approvedLevels = getApprovebLevels(groupsPerson, course.getCourse_name());
        String output = generateAllLevelsCertificateText(person, course.getCourse_name());
        String levelsPart = approvedLevels.stream()
                .map(level -> level.getLevel_name().replaceAll("\\s+", ""))
                .collect(Collectors.joining("_"));
        String code = normalizeText("CERT_ALL_LEVEL_" + person.getDocument()
                + "_" + course.getCourse_name().replaceAll("\\s+", "") + "_" + levelsPart);

        if (output.toLowerCase().startsWith("no")) {
            throw new RuntimeException(output);
        }

        if (!certificateCodeRepo.existsByCode(code)) {
            saveAllCertificateInDB(person, "ALL_LEVEL", code, approvedLevels);
        }
        return code;
    }

    private List<Level> getApprovebLevels(List<GroupPerson> groupsPerson, String courseName) {
        List<Level> approvedLevels = new ArrayList<>();
        for (GroupPerson gp : groupsPerson) {
            Level level = gp.getGroup_id().getLevel_id();
            Course course = level.getId_course();
            if (course.getCourse_name().equalsIgnoreCase(courseName)) {
                LocalDate endDate = gp.getEnd_date().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                if (endDate.isBefore(LocalDate.now())) {
                    if (gp.getCalification() != null && gp.getCalification() >= 3.0) {
                        approvedLevels.add(level);
                    }
                }
            }
        }
        return approvedLevels;
    }

    /** Historial de certificados de un usuario */
    public List<CertificateHistoryDTO> getCertificateHistory(String username) {
        Person person = personService.getPersonByUserName(username);
        List<Certificate> certificates = certificateRepo.findByPerson_PersonId(person.getPersonId());
        List<CertificateHistoryDTO> history = new ArrayList<>();
        for (Certificate cert : certificates) {
            history.add(generateCertificateHistoryDTO(person.getFirstName(), cert));
        }
        return history;
    }

    /** Historial de todos los certificados */
    public List<CertificateHistoryDTO> findAllHistory() {
        List<CertificateHistoryDTO> history = new ArrayList<>();
        for (Certificate cert : certificateRepo.findAll()) {
            history.add(generateCertificateHistoryDTO(cert.getPerson().getFirstName(), cert));
        }
        return history;
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

        List<CertificateLevel> certificateLevels = certificateLevelRepo
                .findByCertificate_CertificateId(certificate.getCertificateId());

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

        return new CertificateHistoryDTO(courseName, levelName, fullName, personId, generationDate, certificateType,
                code);
    }

    /** Valida y genera el PDF de un certificado existente */
    public byte[] validateCertificatePdf(String code) {
        CertificateCode cerCode = certificateCodeRepo.findByCode(code);
        if (cerCode == null) {
            throw new RuntimeException("No existe el certificado.");
        }

        Certificate cert = cerCode.getCertificate();
        Person person = cert.getPerson();
        String certType = cert.getCertificateType().name();

        List<CertificateLevel> levels = certificateLevelRepo.findByCertificate_CertificateId(cert.getCertificateId());
        if (levels.isEmpty()) {
            throw new RuntimeException("No tiene niveles asociados este certificado");
        }

        // ALL_LEVEL
        if (certType.equalsIgnoreCase("ALL_LEVEL")) {
            String courseName = levels.get(0).getLevel().getId_course().getCourse_name();
            String text = generateAllLevelsCertificateText(person, courseName);
            return generatePDF(text, cert.getGenerationDate(), code);
        }

        // Nivel específico
        Level level = levels.get(0).getLevel();
        GroupPerson gp = groupService.getGroupByPersonAndLevel(person.getPersonId(), level.getLevel_id());
        if (gp == null) {
            throw new RuntimeException("No se encontró la relación entre la persona y el nivel del certificado.");
        }
        LocalDate endDate = gp.getEnd_date().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

        // ABILITIES
        if (certType.equalsIgnoreCase("ABILITIES")) {
            String courseName = level.getId_course().getCourse_name();
            String courseDesc = level.getId_course().getCourse_description();
            String text = generateAbilitiesCertificateText(person, courseName, courseDesc, level.getLevel_name());
            return generatePDF(text, cert.getGenerationDate(), code);
        }

        // BASIC / NOTES
        String text = generateLevelCertificateText(person, certType, endDate, level, gp);
        return generatePDF(text, cert.getGenerationDate(), code);
    }

    // -------------------- Private DB Save Methods --------------------
    private void saveLevelCertificateInDB(Person person, String type, Level level, String code) {
        Certificate cert = new Certificate();
        cert.setPerson(person);
        cert.setCertificateType(Certificate.CertificateType.valueOf(type.toUpperCase()));
        cert.setGenerationDate(new Date());
        cert = certificateRepo.save(cert);

        CertificateCode cc = new CertificateCode();
        cc.setCertificate(cert);
        cc.setCode(code);
        certificateCodeRepo.save(cc);

        CertificateLevel cl = new CertificateLevel();
        cl.setCertificate(cert);
        cl.setLevel(level);
        certificateLevelRepo.save(cl);
    }

    private void saveAllCertificateInDB(Person person, String type, String code, List<Level> levels) {
        Certificate cert = new Certificate();
        cert.setPerson(person);
        cert.setCertificateType(Certificate.CertificateType.valueOf(type.toUpperCase()));
        cert.setGenerationDate(new Date());
        cert = certificateRepo.save(cert);

        CertificateCode cc = new CertificateCode();
        cc.setCertificate(cert);
        cc.setCode(code);
        certificateCodeRepo.save(cc);

        for (Level lvl : levels) {
            CertificateLevel cl = new CertificateLevel();
            cl.setCertificate(cert);
            cl.setLevel(lvl);
            certificateLevelRepo.save(cl);
        }
    }

    // -------------------- Text Generation Helpers --------------------
    private String generateTitle(Person person) {
        return "Informa que, " + person.getFirstName() + " " + person.getLastName() + ", identificado con "
                + person.getDocumentType() + " " + person.getDocument();
    }

    private String generateCode(LocalDate endDate, String type, Person person, Level level) {
        String stage = endDate.isAfter(LocalDate.now()) && type.equals("BASIC") ? "MATRICULA" : "APROBACION";
        return "CERT_" + stage + "_" + type.toUpperCase() + "_" + person.getDocument()
                + "_" + level.getId_course().getCourse_name().replaceAll("\\s+", "")
                + "_" + level.getLevel_name().replaceAll("\\s+", "");
    }

    private String generateBodyOfBasicCertificate(Level level, GroupPerson gp) {
        return level.getId_course().getCourse_name() + " " + level.getLevel_name()
                + " con una intensidad de " + gp.getLevel_duration() + " horas.";
    }

    private String generateBodyOfNotesCertificate(Level level, GroupPerson gp) {
        return ", cursó y aprobó el nivel del programa en idioma Extranjero "
                + level.getId_course().getCourse_name() + " " + level.getLevel_name()
                + " con una nota de " + gp.getCalification()
                + " y con una intensidad de " + gp.getLevel_duration() + " horas.";
    }

    private String generateLevelCertificateText(Person person, String type, LocalDate endDate,
            Level level, GroupPerson gp) {

        validateLevelCertificate(person, type, endDate, level, gp);

        StringBuilder sb = new StringBuilder(generateTitle(person));

        if (type.equalsIgnoreCase("basic")) {
            if (endDate.isAfter(LocalDate.now())) {
                sb.append(", actualmente se encuentra matriculado(a) y esta cursando el idioma Extranjero ");
            } else {
                sb.append(", cursó y aprobó el nivel del programa en idioma Extranjero ");
            }
            sb.append(generateBodyOfBasicCertificate(level, gp));
        } else if (type.equalsIgnoreCase("notes")) {
            sb.append(generateBodyOfNotesCertificate(level, gp));
        } else {
            throw new RuntimeException(
                    "No se pudo generar el certificado. Ha ocurrido un error con el tipo de certificado.");
        }
        return sb.toString();
    }

    private String generateAbilitiesCertificateText(Person person, String courseName,
            String courseDesc, String levelName) {
        return String.format(
                "Informa que, %s %s, identificado con %s %s presentó el examen de suficiencia en idioma extranjero - %s %s, obteniendo nivel (%s), según el Marco Común de Referencia Europeo - CEFR.",
                person.getFirstName(), person.getLastName(), person.getDocumentType(),
                person.getDocument(), courseName, courseDesc, levelName);
    }

    public String generateAllLevelsCertificateText(Person person, String courseName) {
        List<GroupPerson> groups = groupService.getGroupByPerson(person.getPersonId());
        boolean match = false, finished = false, approved = false;
        List<String> levels = new ArrayList<>();
        int hours = 0;
        int nullCalificationCount = 0;

        for (GroupPerson gp : groups) {
            Level lvl = gp.getGroup_id().getLevel_id();
            Course course = lvl.getId_course();

            if (course.getCourse_name().equalsIgnoreCase(courseName)) {
                match = true;
                LocalDate end = gp.getEnd_date().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

                if (end.isBefore(LocalDate.now())) {
                    finished = true;

                    Float calification = gp.getCalification();
                    if (calification == null) {
                        nullCalificationCount++;
                    } else if (calification >= 3.0) {
                        approved = true;
                        levels.add(lvl.getLevel_name());
                        hours += Integer.parseInt(gp.getLevel_duration());
                    }
                }
            }
        }

        if (!match) {
            throw new RuntimeException(
                    "No se generó el certificado, porque el usuario no tiene ningún curso asociado con el nombre proporcionado.");
        }

        if (!finished) {
            throw new RuntimeException(
                    "No se generó el certificado, porque el usuario no ha finalizado ningún curso asociado.");
        }

        if (!approved) {
            if (nullCalificationCount > 0) {
                String msg = nullCalificationCount == 1
                        ? "No se generó el certificado, porque no se ha calificado el curso."
                        : "No se generó el certificado, porque no se han calificado los cursos.";
                throw new RuntimeException(msg);
            } else {
                throw new RuntimeException(
                        "No se generó el certificado, porque el usuario debe aprobar al menos un nivel del curso para generar el certificado.");
            }
        }

        return buildCertificateText(person, courseName, levels, hours);
    }

    private String buildCertificateText(Person person, String courseName,
            List<String> approvedLevels, int hours) {
        StringBuilder sb = new StringBuilder(generateTitle(person));
        sb.append(", cursó y aprobó el curso de idioma Extranjero ").append(courseName);
        sb.append(approvedLevels.size() > 1 ? " en los niveles " : " en el nivel ")
                .append(String.join(", ", approvedLevels));
        sb.append(" con una intensidad total de ").append(hours).append(" horas.");
        return sb.toString();
    }

    // -------------------- PDF & Formatting --------------------
    private byte[] generatePDF(String content, Date date, String code) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf, PageSize.LETTER.rotate());
            doc.setMargins(130, 80, 100, 80);

            PdfPage page = pdf.addNewPage();
            URL bgUrl = getClass().getResource("/static/images/Certificado-pica (1).png");
            ImageData bg = ImageDataFactory.create(bgUrl);
            new PdfCanvas(page).addImageFittedIntoRectangle(bg, page.getPageSize(), false);

            doc.add(new Paragraph("\n"));
            doc.add(new Paragraph(
                    "UNIVERSIDAD PEDAGÓGICA Y TECNOLÓGICA DE COLOMBIA\nINSTITUTO INTERNACIONAL DE IDIOMAS")
                    .setBold().setFontSize(16).setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph(code).setFontSize(9).setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.DARK_GRAY));
            doc.add(new Paragraph("\n\n"));
            doc.add(new Paragraph(content).setFontSize(12).setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph(formatearFechaEstiloCertificado(date))
                    .setFontSize(10).setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("\n\n\n\n\n"));
            doc.add(new Paragraph("__________________________\nCoordinador Instituto de Idiomas")
                    .setFontSize(10).setTextAlignment(TextAlignment.CENTER));

            String qr = "https://app.certigestdev.click:8443/certificate/validateCertificate/" + code;
            PdfFormXObject qrObj = new BarcodeQRCode(qr).createFormXObject(ColorConstants.BLACK, pdf);
            Image qrImage = new Image(qrObj).scaleAbsolute(80, 80);
            float x = pdf.getDefaultPageSize().getWidth() - 100, y = 40;
            qrImage.setFixedPosition(x, y);
            doc.add(qrImage);

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el PDF", e);
        }
    }

    private String formatearFechaEstiloCertificado(Date fecha) {
        SimpleDateFormat dia = new SimpleDateFormat("d");
        SimpleDateFormat mes = new SimpleDateFormat("MMMM");
        SimpleDateFormat anio = new SimpleDateFormat("yyyy");
        return String.format("Tunja, Colombia, %s de %s del año %s",
                dia.format(fecha), mes.format(fecha), anio.format(fecha));
    }

    public String normalizeText(String input) {
        return Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    }
}
