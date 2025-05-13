package com.uptc.idiomas.certigest.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uptc.idiomas.certigest.dto.CourseDTO;
import com.uptc.idiomas.certigest.service.CourseService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CourseController.class)
@WithMockUser
public class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CourseService courseService;

    @Autowired
    private ObjectMapper objectMapper;

    private CourseDTO sampleCourse;

    @BeforeEach
    void setUp() {
        sampleCourse = new CourseDTO();
        sampleCourse.setId_course(1);
        sampleCourse.setCourse_name("Sample Course");
        sampleCourse.setCourse_description("Sample Description");
    }

    @Test
    void testCreateCourse() throws Exception {
        when(courseService.create(any(CourseDTO.class))).thenReturn(sampleCourse);

        mockMvc.perform(post("/course/createCourse")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleCourse)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id_course").value(sampleCourse.getId_course()))
                .andExpect(jsonPath("$.course_name").value("Sample Course"));

        verify(courseService).create(any(CourseDTO.class));
    }

    @Test
    void testGetCourseById_Found() throws Exception {
        when(courseService.findById(1)).thenReturn(sampleCourse);

        mockMvc.perform(get("/course/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id_course").value(sampleCourse.getId_course()))
                .andExpect(jsonPath("$.course_name").value("Sample Course"));

        verify(courseService).findById(1);
    }

    @Test
    void testGetAllCourses() throws Exception {
        CourseDTO c2 = new CourseDTO();
        c2.setCourse_name("Another");
        when(courseService.findAll()).thenReturn(Arrays.asList(sampleCourse, c2));

        mockMvc.perform(get("/course/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        verify(courseService).findAll();
    }

    @Test
    void testUpdateCourse() throws Exception {
        CourseDTO updated = new CourseDTO();
        updated.setCourse_name("Updated");
        when(courseService.update(any(CourseDTO.class))).thenReturn(updated);

        mockMvc.perform(put("/course/update")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.course_name").value("Updated"));

        verify(courseService).update(any(CourseDTO.class));
    }

    @Test
    void testDeleteCourse() throws Exception {
        doNothing().when(courseService).deleteById(1);

        mockMvc.perform(delete("/course/1")
                .with(csrf()))
                .andExpect(status().isNoContent());

        verify(courseService).deleteById(1);
    }
}
