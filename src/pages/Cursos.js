import { useState, useEffect, useCallback } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { createCourse, getAllCourses, createLevel, createGroup, getAllTeachers, getAllGroups, updateCourse, updateGroup, updateLevel, deleteCourse, deleteGroup, deleteLevel, getAllLevels } from "../services/CourseService";

const Cursos = () => {
  const { keycloak } = useKeycloak();
  const [tab, setTab] = useState("modificar");
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({
    course_name: "",
    course_description: "",
    course_type: "DEFAULT",
    language: "",
    creation_date: new Date().toISOString().split("T")[0],
    state: true,
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const [levels, setLevels] = useState([]);

  const handleAddLevel = () => {
    setLevels([
      ...levels,
      {
        level_name: "",
        level_description: "",
        state: true,
        groups: [{ group_name: "", schedule: "", group_teacher: "" , start_date: "", end_date:"", state: true,}],
      },
    ]);
  };

  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editingLevelId, setEditingLevelId] = useState(null);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [expandedLevelId, setExpandedLevelId] = useState(null); // Para controlar el colapso

  const [editedCourse, setEditedCourse] = useState({});
  const [editedLevel, setEditedLevel] = useState({});
  const [editedGroup, setEditedGroup] = useState({});

  const handleRemoveLevel = (indexToRemove) => {
    setLevels(levels.filter((_, index) => index !== indexToRemove));
  };

  const handleAddGroup = (levelIndex) => {
    const updated = [...levels];
    updated[levelIndex].groups.push({ group_name: "", schedule: "", group_teacher: "" , start_date: "", end_date:"", state: true,});
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
    setCourseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Crear el curso
      const createdCourse = await createCourse(courseForm, keycloak.token);

      // 2. Crear niveles con courseId
      for (const level of levels) {
        const createdLevel = await createLevel(
          {
            id_course: createdCourse,
            level_name: level.level_name,
            level_description: level.level_description,
            state: level.state,
          },
          keycloak.token
        );

        // 3. Crear grupos con levelId
        for (const group of level.groups) {
          await createGroup(
            {
              group_name: group.group_name,
              schedule: group.schedule,
              level_id: createdLevel,
              group_teacher: group.group_teacher ? { personId: parseInt(group.group_teacher) } : null,
              start_date: group.start_date,
              end_date: group.end_date,
              state: group.state,
            },
            keycloak.token
          );
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

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const teachersData = await getAllTeachers(keycloak.token);
        console.log("Profesores obtenidos:", teachersData);
        setTeachers(teachersData);
      } catch (error) {
        console.error("Error al obtener profesores:", error);
      }
    }
    fetchTeachers();
  }, []);

  const [teachers, setTeachers] = useState([]);

  const [groupData, setGroupData] = useState([]);

  useEffect(() => {
    if (tab === "ver" && keycloak?.authenticated) {
      getAllGroups(keycloak.token)
        .then(setGroupData)
        .catch((err) => console.error("Error al obtener grupos:", err));
    }
  }, [tab, keycloak]);

  const [creatingGroupForLevelId, setCreatingGroupForLevelId] = useState(null);
  const [newGroup, setNewGroup] = useState({
    group_name: "",
    schedule: "",
    group_teacher: null,
  });


  const [creatingLevelForCourseId, setCreatingLevelForCourseId] = useState(null);
  const [newLevelGroup, setNewLevelGroup] = useState({
    level_name: "",
    level_description: "",
    group_name: "",
    schedule: "",
    group_teacher: null,
  });


  const handleStartCreatingLevel = (courseId) => {
    setCreatingLevelForCourseId(courseId);
    setNewLevelGroup({
      level_name: "",
      level_description: "",
      group_name: "",
      schedule: "",
      group_teacher: null,
    });
  };

  const handleCancelCreatingLevel = () => {
    setCreatingLevelForCourseId(null);
    setNewLevelGroup({
      level_name: "",
      level_description: "",
      group_name: "",
      schedule: "",
      group_teacher: null,
    });
  };

  const handleNewLevelGroupChange = (e) => {
    const { name, value } = e.target;
    setNewLevelGroup((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveNewLevel = async (courseId) => {
    try {
      //Crear nivel
      const levelToCreate = {
        id_course: { id_course: courseId },
        level_name: newLevelGroup.level_name,
        level_description: newLevelGroup.level_description,
      };
      const createdLevel = await createLevel(levelToCreate, keycloak.token);

      console.log("Nivel Creado" + createdLevel.level_id);

      //Crear grupo asociado (grupo inicial)
      await createGroup(
        {
          group_name: newLevelGroup.group_name,
          schedule: newLevelGroup.schedule,
          level_id: { level_id: createdLevel.level_id },
          group_teacher: { personId: parseInt(newLevelGroup.group_teacher.personId) },
        },
        keycloak.token
      );

      //Refrescar datos
      const fresh = await getAllGroups(keycloak.token);
      setGroupData(fresh);

      //Salir de modo crea
      handleCancelCreatingLevel();
    } catch (err) {
      console.error("Error creando nivel y grupo:", err);
    }
  };

  const renderTab = () => {
    switch (tab) {
      case "crear":
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
                  <input type="text" name="course_name" className="form-control border-secondary" value={courseForm.course_name} onChange={handleInputChange} required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Descripción del Curso</label>
                  <textarea name="course_description" className="form-control border-secondary" rows="3" value={courseForm.course_description} onChange={handleInputChange} required></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label">Tipo de Curso</label>
                  <select name="course_type" className="form-select border-secondary" value={courseForm.course_type} onChange={handleInputChange} required>
                    <option value="DEFAULT">Normal</option>
                    <option value="KIDS">Niños</option>
                    <option value="SKILLS">Curso con Habilidades</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Idioma</label>
                  <input type="text" name="language" className="form-control border-secondary" value={courseForm.language} onChange={handleInputChange} required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Fecha de Creación</label>
                  <input type="date" name="creation_date" className="form-control border-secondary" value={courseForm.creation_date} onChange={handleInputChange} required />
                </div>
              </div>

              {/* SECCIÓN NIVELES */}
              <div className="col-md-6">
                <div className="p-3 border border-warning border-3 rounded bg-warning" style={{ maxHeight: "500px", overflowY: "auto" }}>
                  {levels.map((level, levelIndex) => (
                    <div key={levelIndex} className="mb-4 p-3 border border-warning rounded bg-light">
                      {/* Encabezado Nivel */}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="text-warning mb-0">Nivel #{levelIndex + 1}</h5>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveLevel(levelIndex)}>
                          Eliminar Nivel
                        </button>
                      </div>

                      {/* Campos del Nivel */}
                      <div className="mb-2">
                        <label className="form-label">Nombre del Nivel</label>
                        <input type="text" name="level_name" className="form-control" value={level.level_name} onChange={(e) => handleLevelChange(e, levelIndex)} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Descripción del Nivel</label>
                        <textarea name="level_description" className="form-control" rows="2" value={level.level_description} onChange={(e) => handleLevelChange(e, levelIndex)}></textarea>
                      </div>

                      {/* Grupos */}
                      <div className="bg-white border rounded p-2 mb-3">
                        <h6 className="text-secondary">Grupos</h6>
                        {level.groups.map((group, groupIndex) => (
                          <div key={groupIndex} className="mb-3 p-3 bg-body border-start border-secondary border-3 rounded position-relative">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="text-secondary mb-0">Grupo #{groupIndex + 1}</h6>
                              {level.groups.length > 1 && (
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveGroup(levelIndex, groupIndex)}>
                                  Eliminar Grupo
                                </button>
                              )}
                            </div>

                            <div className="mb-2">
                              <label className="form-label">Nombre del Grupo</label>
                              <input type="text" name="group_name" className="form-control" value={group.group_name} onChange={(e) => handleGroupChange(e, levelIndex, groupIndex)} required />
                            </div>

                            <div className="mb-2">
                              <label className="form-label">Horario</label>
                              <input type="text" name="schedule" className="form-control" value={group.schedule} onChange={(e) => handleGroupChange(e, levelIndex, groupIndex)} required />
                            </div>
                            <div className="mb-2">
                              <label className="form-label">Profesor Asignado</label>
                              <select name="group_teacher" className="form-select" value={group.group_teacher || ""} onChange={(e) => handleGroupChange(e, levelIndex, groupIndex)} required>
                                <option value="">Seleccione un profesor</option>
                                {teachers.map((teacher) => (
                                  <option key={teacher.personId} value={teacher.personId}>
                                    {teacher.firstName} {teacher.lastName} - {teacher.email}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="row mb-2">
                              <div className="col">
                                <label className="form-label">Fecha de Inicio</label>
                                <input
                                  type="date"
                                  name="start_date"
                                  className="form-control"
                                  value={group.start_date || ""}
                                  onChange={(e) => handleGroupChange(e, levelIndex, groupIndex)}
                                  required
                                />
                              </div>
                              <div className="col">
                                <label className="form-label">Fecha de Fin</label>
                                <input
                                  type="date"
                                  name="end_date"
                                  className="form-control"
                                  value={group.end_date || ""}
                                  onChange={(e) => handleGroupChange(e, levelIndex, groupIndex)}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Botón agregar grupo */}
                      <div className="text-center">
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleAddGroup(levelIndex)}>
                          Agregar Grupo
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Botón agregar nivel */}
                  <div className="text-center">
                    <button type="button" className="btn btn-outline-dark mt-2" onClick={handleAddLevel}>
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
        const handleDeleteCourse = async (courseId) => {
          try {
            await deleteCourse(courseId, keycloak.token);
            setGroupData((prev) => prev.filter((g) => g.level_id.id_course.id_course !== courseId));
          } catch (err) {
            console.error("Error eliminando curso:", err);
          }
        };

        const handleDeleteLevel = async (levelId) => {
          try {
            await deleteLevel(levelId, keycloak.token);
            setGroupData((prev) => prev.filter((g) => g.level_id.level_id !== levelId));
          } catch (err) {
            console.error("Error eliminando nivel:", err);
          }
        };

        const handleDeleteGroup = async (groupId) => {
          try {
            await deleteGroup(groupId, keycloak.token);
            setGroupData((prev) => prev.filter((g) => g.group_id !== groupId));
          } catch (err) {
            console.error("Error eliminando grupo:", err);
          }
        };

        const handleCourseChange = (e) => {
          const { name, value } = e.target;
          setEditedCourse((prev) => ({ ...prev, [name]: value }));
        };

        const handleLevel = (e) => {
          const { name, value } = e.target;
          setEditedLevel((prev) => ({ ...prev, [name]: value }));
        };

        const handleGroup = (e) => {
          const { name, value } = e.target;
          setEditedGroup((prev) => ({ ...prev, [name]: value }));
        };

        const handleEditCourse = (course) => {
          setEditingCourseId(course.id_course);
          setEditedCourse(course);
        };

        const handleEditLevel = (level) => {
          setEditingLevelId(level.level_id);
          setEditedLevel(level);
          setExpandedLevelId(level.level_id); // mantener expandido
        };

        const handleEditGroup = (group) => {
          setEditingGroupId(group.group_id);
          setEditedGroup(group);
        };

        const handleCancelEdit = () => {
          setEditingCourseId(null);
          setEditingLevelId(null);
          setEditingGroupId(null);
          setEditedCourse({});
          setEditedLevel({});
          setEditedGroup({});
        };

        const handleSaveCourse = async () => {
          try {
            await updateCourse(editedCourse, keycloak.token);
            const updated = groupData.map((g) => {
              if (g.level_id.id_course.id_course === editedCourse.id_course) {
                return {
                  ...g,
                  level_id: {
                    ...g.level_id,
                    id_course: editedCourse,
                  },
                };
              }
              return g;
            });
            setGroupData(updated);
            handleCancelEdit();
          } catch (err) {
            console.error("Error actualizando curso:", err);
          }
        };

        const handleSaveLevel = async () => {
          try {
            await updateLevel(editedLevel, keycloak.token);
            const updated = groupData.map((g) => {
              if (g.level_id.level_id === editedLevel.level_id) {
                return {
                  ...g,
                  level_id: editedLevel,
                };
              }
              return g;
            });
            setGroupData(updated);
            handleCancelEdit();
          } catch (err) {
            console.error("Error actualizando nivel:", err);
          }
        };

        const handleSaveGroup = async () => {
          try {
            await updateGroup(editedGroup, keycloak.token);
            const updated = groupData.map((g) => (g.group_id === editedGroup.group_id ? editedGroup : g));
            setGroupData(updated);
            handleCancelEdit();
          } catch (err) {
            console.error("Error actualizando grupo:", err);
          }
        };

        const groupedCourses = groupData.reduce((acc, group) => {
          const course = group.level_id.id_course;
          const level = group.level_id;

          if (!acc[course.id_course]) {
            acc[course.id_course] = { course, levels: {} };
          }

          if (!acc[course.id_course].levels[level.level_id]) {
            acc[course.id_course].levels[level.level_id] = {
              level,
              groups: [],
            };
          }

          acc[course.id_course].levels[level.level_id].groups.push(group);

          return acc;
        }, {});

        const accordionStyle = {
          backgroundColor: "inherit", // Mantén el color de fondo original
          border: "none", // Elimina el borde
          boxShadow: "none", // Elimina el borde de foco
        };

        const accordionButtonStyle = {
          backgroundColor: "inherit",
          border: "none",
          boxShadow: "none",
          color: "#000",
        };

        const handleNewGroupChange = (e) => {
          const { name, value } = e.target;
          setNewGroup((prev) => ({ ...prev, [name]: value }));
        };

        const handleStartCreatingGroup = (levelId) => {
          setCreatingGroupForLevelId(levelId);
          setNewGroup({
            group_name: "",
            schedule: "",
            group_teacher: null,
          });
        };

        const handleCancelCreatingGroup = () => {
          setCreatingGroupForLevelId(null);
          setNewGroup({
            group_name: "",
            schedule: "",
            group_teacher: null,
          });
        };

        const handleSaveNewGroup = async (levelId) => {
          try {
            const groupToCreate = {
              ...newGroup,
              level_id: { level_id: levelId },
            };

            await createGroup(groupToCreate, keycloak.token);
            const fresh = await getAllGroups(keycloak.token);
            setGroupData(fresh);
            handleCancelCreatingGroup();
          } catch (err) {
            console.error("Error creando grupo:", err);
          }
        };

        return (
          <div className="container mt-4">
            {Object.values(groupedCourses).map(({ course, levels }) => (
              <div key={course.id_course} className="mb-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-warning text-white d-flex justify-content-between align-items-center">
                    {editingCourseId === course.id_course ? <input name="course_name" value={editedCourse.course_name} onChange={handleCourseChange} className="form-control me-2" /> : <h5 className="mb-0">{course.course_name}</h5>}
                    <div className="d-flex">
                      {editingCourseId === course.id_course ? (
                        <>
                          <button className="btn btn-sm btn-success me-2" onClick={handleSaveCourse}>
                            Guardar
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditCourse(course)}>
                            Modificar
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteCourse(course.id_course)}>
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    {editingCourseId === course.id_course ? (
                      <>
                        <input className="form-control mb-2" name="course_description" value={editedCourse.course_description} onChange={handleCourseChange} />
                        <input className="form-control mb-2" name="language" value={editedCourse.language} onChange={handleCourseChange} />
                        <input className="form-control mb-2" name="course_type" value={editedCourse.course_type} onChange={handleCourseChange} />
                      </>
                    ) : (
                      <>
                        <p>{course.course_description}</p>
                        <p>
                          <strong>Idioma:</strong> {course.language} | <strong>Tipo:</strong> {course.course_type}
                        </p>
                        <p>
                          <strong>Fecha de creación:</strong> {new Date(course.creation_date).toLocaleDateString()}
                        </p>
                      </>
                    )}

                    <div className="accordion" style={accordionStyle} id={`accordion-${course.id_course}`}>
                      {Object.values(levels).map(({ level, groups }) => {
                        const isEditing = editingLevelId === level.level_id;
                        const isExpanded = expandedLevelId === level.level_id;

                        // Contar cuántos niveles tiene este curso
                        const levelsInSameCourse = Object.values(levels).filter(({ level: lvl }) => lvl.id_course.id_course === course.id_course);
                        const isOnlyLevelInCourse = levelsInSameCourse.length === 1;

                        return (
                          <div key={level.level_id} className="accordion-item">
                            <h2 className="accordion-header d-flex justify-content-between align-items-center" id={`heading-${level.level_id}`}>
                              <button
                                className="accordion-button d-flex justify-content-between align-items-center"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapse-${level.level_id}`}
                                aria-expanded={isExpanded}
                                aria-controls={`collapse-${level.level_id}`}
                                onClick={(e) => {
                                  if (isEditing) e.preventDefault();
                                  else setExpandedLevelId(level.level_id);
                                }}
                                style={accordionButtonStyle}
                              >
                                {isEditing ? (
                                  <div className="w-100 d-flex gap-2">
                                    <input className="form-control" name="level_name" value={editedLevel.level_name} onChange={handleLevel} />
                                    <input className="form-control" name="level_description" value={editedLevel.level_description} onChange={handleLevel} />
                                  </div>
                                ) : (
                                  <span>
                                    {level.level_name} - {level.level_description}
                                  </span>
                                )}
                              </button>
                              <div className="d-flex me-3">
                                {isEditing ? (
                                  <>
                                    <button className="btn btn-sm btn-success me-2" onClick={handleSaveLevel}>
                                      Guardar
                                    </button>
                                    <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>
                                      Cancelar
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditLevel(level)}>
                                      Modificar
                                    </button>
                                    {!isOnlyLevelInCourse && (
                                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteLevel(level.level_id)}>
                                        Eliminar
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </h2>
                            <div id={`collapse-${level.level_id}`} className={`accordion-collapse collapse ${isExpanded ? "show" : ""}`}>
                              <div className="accordion-body">
                                <div className="container mt-4">
                                  {groups
                                    .filter((group) => group.level_id.level_id === level.level_id)
                                    .map((group) => {
                                      const groupsInSameLevel = groups.filter((g) => g.level_id.level_id === level.level_id);
                                      const isOnlyGroupInLevel = groupsInSameLevel.length === 1;
                                      return (
                                        <div key={group.group_id} className="card mb-3">
                                          <div className="card-header d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">Grupo: {group.group_name}</h5>
                                            <div>
                                              {editingGroupId === group.group_id ? (
                                                <>
                                                  <button className="btn btn-sm btn-success me-2" onClick={handleSaveGroup}>
                                                    Guardar
                                                  </button>
                                                  <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>
                                                    Cancelar
                                                  </button>
                                                </>
                                              ) : (
                                                <>
                                                  <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditGroup(group)}>
                                                    Modificar
                                                  </button>
                                                  {!isOnlyGroupInLevel && (
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteGroup(group.group_id)}>
                                                      Eliminar
                                                    </button>
                                                  )}
                                                </>
                                              )}
                                            </div>
                                          </div>

                                          <div className="card-body">
                                            {editingGroupId === group.group_id ? (
                                              <div>
                                                <div className="mb-3">
                                                  <label htmlFor="group_name" className="form-label">
                                                    Nombre del Grupo
                                                  </label>
                                                  <input id="group_name" className="form-control" name="group_name" value={editedGroup.group_name} onChange={handleGroup} />
                                                </div>
                                                <div className="mb-3">
                                                  <label htmlFor="schedule" className="form-label">
                                                    Horario
                                                  </label>
                                                  <input id="schedule" className="form-control" name="schedule" value={editedGroup.schedule} onChange={handleGroup} />
                                                </div>
                                                <div className="mb-3">
                                                  <label htmlFor="group_teacher" className="form-label">
                                                    Profesor
                                                  </label>
                                                  <select
                                                    id="group_teacher"
                                                    name="group_teacher"
                                                    className="form-select"
                                                    value={editedGroup.group_teacher?.personId || ""}
                                                    onChange={(e) =>
                                                      setEditedGroup((prev) => ({
                                                        ...prev,
                                                        group_teacher: teachers.find((t) => t.personId === parseInt(e.target.value)) || null,
                                                      }))
                                                    }
                                                  >
                                                    <option value="">Seleccione un profesor</option>
                                                    {teachers.map((teacher) => (
                                                      <option key={teacher.personId} value={teacher.personId}>
                                                        {teacher.firstName} {teacher.lastName} - {teacher.email}
                                                      </option>
                                                    ))}
                                                  </select>
                                                </div>
                                              </div>
                                            ) : (
                                              <div>
                                                <p>
                                                  <strong>Horario:</strong> {group.schedule}
                                                </p>
                                                <p>
                                                  <strong>Profesor:</strong> {group.group_teacher ? `${group.group_teacher.firstName} ${group.group_teacher.lastName}` : "No asignado"}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  {creatingGroupForLevelId === level.level_id ? (
                                    <div className="card mb-3">
                                      <div className="card-header d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">Nuevo Grupo</h5>
                                        <div>
                                          <button className="btn btn-sm btn-success me-2" onClick={() => handleSaveNewGroup(level.level_id)}>
                                            Guardar
                                          </button>
                                          <button className="btn btn-sm btn-secondary" onClick={handleCancelCreatingGroup}>
                                            Cancelar
                                          </button>
                                        </div>
                                      </div>
                                      <div className="card-body">
                                        <div className="mb-3">
                                          <label htmlFor="new_group_name" className="form-label">
                                            Nombre del Grupo
                                          </label>
                                          <input id="new_group_name" className="form-control" name="group_name" value={newGroup.group_name} onChange={handleNewGroupChange} />
                                        </div>
                                        <div className="mb-3">
                                          <label htmlFor="new_schedule" className="form-label">
                                            Horario
                                          </label>
                                          <input id="new_schedule" className="form-control" name="schedule" value={newGroup.schedule} onChange={handleNewGroupChange} />
                                        </div>
                                        <div className="mb-3">
                                          <label htmlFor="new_group_teacher" className="form-label">
                                            Profesor
                                          </label>
                                          <select
                                            id="new_group_teacher"
                                            name="group_teacher"
                                            className="form-select"
                                            value={newGroup.group_teacher?.personId || ""}
                                            onChange={(e) =>
                                              setNewGroup((prev) => ({
                                                ...prev,
                                                group_teacher: teachers.find((t) => t.personId === parseInt(e.target.value)) || null,
                                              }))
                                            }
                                          >
                                            <option value="">Seleccione un profesor</option>
                                            {teachers.map((teacher) => (
                                              <option key={teacher.personId} value={teacher.personId}>
                                                {teacher.firstName} {teacher.lastName} - {teacher.email}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="d-flex justify-content-end">
                                      <button className="btn btn-outline-primary btn-sm" onClick={() => handleStartCreatingGroup(level.level_id)}>
                                        + Agregar Grupo
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {creatingLevelForCourseId === course.id_course ? (
                      <div className="card mb-3 mt-3">
                        <div className="card-header d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">Nuevo Nivel</h5>
                          <div>
                            <button className="btn btn-sm btn-success me-2" disabled={!newLevelGroup.level_name.trim() || !newLevelGroup.group_name.trim()} onClick={() => handleSaveNewLevel(course.id_course)}>
                              Guardar
                            </button>
                            <button className="btn btn-sm btn-secondary" onClick={handleCancelCreatingLevel}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Nombre del Nivel</label>
                            <input className="form-control" name="level_name" value={newLevelGroup.level_name} onChange={handleNewLevelGroupChange} />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Descripción del Nivel</label>
                            <textarea className="form-control" rows="2" name="level_description" value={newLevelGroup.level_description} onChange={handleNewLevelGroupChange} />
                          </div>
                          <h6>Grupo Inicial</h6>
                          <div className="mb-3">
                            <label className="form-label">Nombre del Grupo</label>
                            <input className="form-control" name="group_name" value={newLevelGroup.group_name} onChange={handleNewLevelGroupChange} />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Horario</label>
                            <input className="form-control" name="schedule" value={newLevelGroup.schedule} onChange={handleNewLevelGroupChange} />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Profesor</label>
                            <select
                              className="form-select"
                              name="group_teacher"
                              value={newLevelGroup.group_teacher?.personId || ""}
                              onChange={(e) =>
                                setNewLevelGroup((prev) => ({
                                  ...prev,
                                  group_teacher: teachers.find((t) => t.personId === parseInt(e.target.value)) || null,
                                }))
                              }
                            >
                              <option value="">Seleccione un profesor</option>
                              {teachers.map((teacher) => (
                                <option key={teacher.personId} value={teacher.personId}>
                                  {teacher.firstName} {teacher.lastName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-end mt-3">
                        <button className="btn btn-outline-primary btn-sm" onClick={() => handleStartCreatingLevel(course.id_course)}>
                          + Agregar Nivel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex space-x-4 mb-4">
        {["ver", "crear"].map((tabName) => (
          <button key={tabName} className={`px-4 py-2 border ${tab === tabName ? "bg-yellow-300" : ""}`} onClick={() => setTab(tabName)}>
            {tabName.charAt(0).toUpperCase() + tabName.slice(1)} Cursos
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
};

export default Cursos;
