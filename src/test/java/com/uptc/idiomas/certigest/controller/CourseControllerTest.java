package com.uptc.idiomas.certigest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uptc.idiomas.certigest.dto.CourseDTO;
import com.uptc.idiomas.certigest.entity.Course;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateCourseEndpoint() throws Exception {
        // Arrange: Creamos un DTO de Course
        CourseDTO dto = new CourseDTO();
        dto.setCourse_name("Curso de Python");
        dto.setCourse_description("Curso básico de Python");
        dto.setLanguage("Español");
        dto.setCourse_type(Course.CourseType.DEFAULT);

        // Act: Realizamos la petición POST
        mockMvc.perform(post("/course/createCourse")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated()) // Verificamos que el estado es 201
                .andExpect(jsonPath("$.course_name").value("Curso de Python")) // Verificamos los datos de la respuesta
                .andExpect(jsonPath("$.language").value("Español"));
    }
}
