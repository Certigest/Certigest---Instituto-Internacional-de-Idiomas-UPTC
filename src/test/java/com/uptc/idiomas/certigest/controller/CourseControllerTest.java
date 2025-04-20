package com.uptc.idiomas.certigest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uptc.idiomas.certigest.dto.CourseDTO;
import com.uptc.idiomas.certigest.entity.Course.CourseType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateCourseEndpoint() throws Exception {
        CourseDTO dto = new CourseDTO();
        dto.setCourse_name("Inglés Básico");
        dto.setCourse_description("Curso de iniciación");
        dto.setCourse_type("DEFAULT");
        dto.setLanguage("Inglés");
        dto.setCreation_date(new Date());

        mockMvc.perform(post("/course/createCourse")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.course_name").value("Inglés Básico"))
                .andExpect(jsonPath("$.language").value("Inglés"));
    }
}
