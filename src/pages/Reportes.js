import React, { useState, useEffect } from 'react';
import { Card } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import { useKeycloak } from '@react-keycloak/web';
import { getCourseReport } from '../services/CourseService';

export default function Reports() {
  const [courses, setCourses] = useState([]);
  const [expandedCourseIds, setExpandedCourseIds] = useState([]);
  const { keycloak } = useKeycloak();

  const toggleLevels = (courseId) => {
    setExpandedCourseIds(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (keycloak?.token) {
        try {
          const data = await getCourseReport(keycloak.token);
          setCourses(data);
        } catch (error) {
          console.error('Error fetching course report:', error);
        }
      }
    };
    fetchData();
  }, [keycloak]);

  return (
    <div className="container mt-4">
      {courses.map(course => (
        <Card key={course.id_course} className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title>{course.course_name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{course.course_description}</Card.Subtitle>
                <small className="text-muted">Tipo: {course.course_type}</small>
              </div>
              <Button variant="btn btn-warning fw-bold" onClick={() => toggleLevels(course.id_course)}>
                {expandedCourseIds.includes(course.id_course) ? 'Ocultar niveles' : 'Ver niveles'}
              </Button>
            </div>

            {expandedCourseIds.includes(course.id_course) && (
              <div className="mt-3">
                {course.levels.map(level => (
                  <Card key={level.level_id} className="mb-2 bg-light border">
                    <Card.Body>
                      <Card.Title>{level.level_name}</Card.Title>
                      <Card.Text>{level.level_description}</Card.Text>
                      <ul className="list-unstyled mb-0">
                        <li><strong>Costo nivel:</strong> ${level.level_cost}</li>
                        <li><strong>Costo material:</strong> ${level.material_cost}</li>
                        <li><strong>Estudiantes activos:</strong> {level.studentsActive}</li>
                        <li><strong>Ganancias totales:</strong> ${level.totalEarnings}</li>
                      </ul>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
