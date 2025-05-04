import { useState, useEffect, useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { createCourse, getAllCourses, createLevel, createGroup } from '../services/CourseService';

const Cursos = () => {
  const { keycloak } = useKeycloak();
  const [tab, setTab] = useState("modificar");
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({
    course_name: '',
    course_description: '',
    course_type: 'DEFAULT',
    language: '',
    creation_date: new Date().toISOString().split('T')[0],
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const [levels, setLevels] = useState([]);

  const handleAddLevel = () => {
    setLevels([
      ...levels,
      {
        level_name: "",
        level_description: "",
        groups: [{ group_name: "", schedule: "" }],
      },
    ]);
  };
  
  const handleRemoveLevel = (indexToRemove) => {
    setLevels(levels.filter((_, index) => index !== indexToRemove));
  };
  
  const handleLevelChange = (e, levelIndex) => {
    const { name, value } = e.target;
    const updated = [...levels];
    updated[levelIndex][name] = value;
    setLevels(updated);
  };
  
  const handleGroupChange = (e, levelIndex, groupIndex) => {
    const { name, value } = e.target;
    const updated = [...levels];
    updated[levelIndex].groups[groupIndex][name] = value;
    setLevels(updated);
  };
  
  const handleAddGroup = (levelIndex) => {
    const updated = [...levels];
    updated[levelIndex].groups.push({ group_name: "", schedule: "" });
    setLevels(updated);
  };

  const handleRemoveGroup = (levelIndex, groupIndex) => {
    setLevels((prevLevels) => {
      const updatedLevels = [...prevLevels];
      const groups = [...updatedLevels[levelIndex].groups];
  
      if (groups.length > 1) {
        groups.splice(groupIndex, 1);
        updatedLevels[levelIndex].groups = groups;
      }
  
      return updatedLevels;
    });
  };
  

  const loadCourses = useCallback(async () => {
    try {
      const data = await getAllCourses(keycloak.token);
      setCourses(data);
    } catch (err) {
      console.error("Error cargando cursos:", err);
    }
  }, [keycloak.token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // 1. Crear el curso
      const createdCourse = await createCourse(courseForm, keycloak.token);
  
      // 2. Crear niveles con courseId
      for (const level of levels) {
        const createdLevel = await createLevel({
          id_course: createdCourse,
          level_name: level.level_name,
          level_description: level.level_description
        }, keycloak.token);
  
  
        // 3. Crear grupos con levelId
        for (const group of level.groups) {
          await createGroup({
            group_name: group.group_name,
            schedule: group.schedule,
            level_id: createdLevel
          }, keycloak.token);
        }
      }
  
      // Éxito
      setMessage({ type: "success", text: "Curso, niveles y grupos creados correctamente." });
  
      // Opcional: limpiar formulario
      resetForm();
  
    } catch (error) {
      console.error("Error al crear curso:", error);
      setMessage({ type: "danger", text: "Error al crear el curso. Intenta nuevamente." });
    }
  };

  const resetForm = () => {
    setCourseForm({
      course_name: "",
      course_description: "",
      course_type: "DEFAULT",
      language: "",
      creation_date: "",
    });
  
    setLevels([]);
  };  

  useEffect(() => {
    if (tab === "ver" && keycloak?.authenticated) {
      loadCourses();
    }
  }, [tab, keycloak, loadCourses]);

  const renderTab = () => {
    switch (tab) {
      case "crear":
        return (
          <div className="container bg-light text-dark p-4 rounded border border-secondary border-2 mt-3">
            <h3 className="text-dark mb-4">Crear Curso</h3>
      
            {message.text && (
              <div className={`alert alert-${message.type} mt-2`} role="alert">
                {message.text}
              </div>
            )}
      
            <div className="row">
              {/* FORMULARIO PRINCIPAL */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Nombre del Curso</label>
                  <input
                    type="text"
                    name="course_name"
                    className="form-control border-secondary"
                    value={courseForm.course_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
      
                <div className="mb-3">
                  <label className="form-label">Descripción del Curso</label>
                  <textarea
                    name="course_description"
                    className="form-control border-secondary"
                    rows="3"
                    value={courseForm.course_description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
      
                <div className="mb-3">
                  <label className="form-label">Tipo de Curso</label>
                  <select
                    name="course_type"
                    className="form-select border-secondary"
                    value={courseForm.course_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="DEFAULT">Normal</option>
                    <option value="KIDS">Niños</option>
                  </select>
                </div>
      
                <div className="mb-3">
                  <label className="form-label">Idioma</label>
                  <input
                    type="text"
                    name="language"
                    className="form-control border-secondary"
                    value={courseForm.language}
                    onChange={handleInputChange}
                    required
                  />
                </div>
      
                <div className="mb-3">
                  <label className="form-label">Fecha de Creación</label>
                  <input
                    type="date"
                    name="creation_date"
                    className="form-control border-secondary"
                    value={courseForm.creation_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              {/* SECCIÓN NIVELES */}
              <div className="col-md-6">
                <div
                  className="p-3 border border-warning border-3 rounded bg-warning"
                  style={{ maxHeight: "500px", overflowY: "auto" }}
                >
                  {levels.map((level, levelIndex) => (
                    <div key={levelIndex} className="mb-4 p-3 border border-warning rounded bg-light">
                      {/* Encabezado Nivel */}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="text-warning mb-0">Nivel #{levelIndex + 1}</h5>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveLevel(levelIndex)}
                        >
                          Eliminar Nivel
                        </button>
                      </div>

                      {/* Campos del Nivel */}
                      <div className="mb-2">
                        <label className="form-label">Nombre del Nivel</label>
                        <input
                          type="text"
                          name="level_name"
                          className="form-control"
                          value={level.level_name}
                          onChange={(e) => handleLevelChange(e, levelIndex)}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Descripción del Nivel</label>
                        <textarea
                          name="level_description"
                          className="form-control"
                          rows="2"
                          value={level.level_description}
                          onChange={(e) => handleLevelChange(e, levelIndex)}
                        ></textarea>
                      </div>

                      {/* Grupos */}
                      <div className="bg-white border rounded p-2 mb-3">
                        <h6 className="text-secondary">Grupos</h6>
                        {level.groups.map((group, groupIndex) => (
                          <div
                            key={groupIndex}
                            className="mb-3 p-3 bg-body border-start border-secondary border-3 rounded position-relative"
                          >
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="text-secondary mb-0">Grupo #{groupIndex + 1}</h6>
                              {level.groups.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRemoveGroup(levelIndex, groupIndex)}
                                >
                                  Eliminar Grupo
                                </button>
                              )}
                            </div>

                            <div className="mb-2">
                              <label className="form-label">Nombre del Grupo</label>
                              <input
                                type="text"
                                name="group_name"
                                className="form-control"
                                value={group.group_name}
                                onChange={(e) => handleGroupChange(e, levelIndex, groupIndex)}
                                required
                              />
                            </div>

                            <div className="mb-2">
                              <label className="form-label">Horario</label>
                              <input
                                type="text"
                                name="schedule"
                                className="form-control"
                                value={group.schedule}
                                onChange={(e) => handleGroupChange(e, levelIndex, groupIndex)}
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Botón agregar grupo */}
                      <div className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleAddGroup(levelIndex)}
                        >
                          Agregar Grupo
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Botón agregar nivel */}
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-outline-dark mt-2"
                      onClick={handleAddLevel}
                    >
                      Agregar Nivel
                    </button>
                  </div>
                </div>
              </div>


            </div>
      
            {/* BOTÓN DE ENVÍO GLOBAL */}
            <div className="text-end mt-4">
              <button type="submit" className="btn btn-warning fw-bold shadow" onClick={handleSubmit}>
                Crear Curso
              </button>
            </div>
          </div>
        );
      
      case "ver":
        return (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Descripción</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Idioma</th>
                  <th scope="col">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, idx) => (
                  <tr key={idx}>
                    <td>{course.course_name}</td>
                    <td>{course.course_description}</td>
                    <td>{course.course_type}</td>
                    <td>{course.language}</td>
                    <td>{new Date(course.creation_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        

        default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex space-x-4 mb-4">
        {["ver", "crear"].map(tabName => (
          <button
            key={tabName}
            className={`px-4 py-2 border ${tab === tabName ? 'bg-yellow-300' : ''}`}
            onClick={() => setTab(tabName)}
          >
            {tabName.charAt(0).toUpperCase() + tabName.slice(1)} Cursos
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
};

export default Cursos;
