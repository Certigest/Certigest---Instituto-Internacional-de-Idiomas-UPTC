package com.uptc.idiomas.certigest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.uptc.idiomas.certigest.dto.CourseDTO;
import com.uptc.idiomas.certigest.service.CourseService;

@RestController
public class CourseController {
    @Autowired
    CourseService courseService;

    @PostMapping("/course/createCourse")
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO courseDTO) {
        CourseDTO courseCreated = courseService.addCourseInDb(courseDTO);
        return new ResponseEntity<>(courseCreated, HttpStatus.CREATED);
    }
}