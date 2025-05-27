import { useState, useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { Toast, ToastContainer } from "react-bootstrap";
import { createCourse, createLevel, createGroup, getAllTeachers, getAllGroups, updateCourse, updateGroup, updateLevel, deleteCourse, deleteGroup, deleteLevel } from "../services/CourseService";
import ModalConfirm from "../components/ModalConfirm";

const Cursos = () => {
  const { keycloak } = useKeycloak();
  const [tab, setTab] = useState("ver");
  const [courseForm, setCourseForm] = useState({
    course_name: "",
    course_description: "",
    course_type: "DEFAULT",
    language: "",
    creation_date: new Date().toISOString().split("T")[0],
    state: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showFinishedGroups, setShowFinishedGroups] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [modalMessage, setModalMessage] = useState("");

  const openConfirmModal = (action, message) => {
    setConfirmAction(() => action);
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsModalOpen(false);
    setConfirmAction(() => () => {});
  };

  const [message, setMessage] = useState({ type: "", text: "" });
  const handleCloseToast = () => setMessage({ ...message, show: false });
  const [levels, setLevels] = useState([
    {
      level_name: "",
      level_description: "",
      state: true,
      level_cost: 0,
      material_cost: 0,
      level_duration: 1,
      level_modality: "In_person",
      groups: [{ group_name: "", schedule: "", group_teacher: "", start_date: "", end_date: "", state: true }],
    },
  ]);

  const handleAddLevel = () => {
    setLevels([
      ...levels,
      {
        level_name: "",
        level_description: "",
        state: true,
        level_cost: 0,
        material_cost: 0,
        level_duration: 1,
        level_modality: "In_person",
        groups: [{ group_name: "", schedule: "", group_teacher: "", start_date: "", end_date: "", state: true }],
      },
    ]);
  };

  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editingLevelId, setEditingLevelId] = useState(null);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [expandedLevelId, setExpandedLevelId] = useState(null);

  const [editedCourse, setEditedCourse] = useState({});
  const [editedLevel, setEditedLevel] = useState({});
  const [editedGroup, setEditedGroup] = useState({});

  const handleRemoveLevel = (indexToRemove) => {
    setLevels(levels.filter((_, index) => index !== indexToRemove));
  };

  const handleAddGroup = (levelIndex) => {
    const updated = [...levels];
    updated[levelIndex].groups.push({ group_name: "", schedule: "", group_teacher: "", start_date: "", end_date: "", state: true });
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
            level_cost: level.level_cost,
            material_cost: level.material_cost,
            level_duration: level.level_duration,
            level_modality: level.level_modality,
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

    setLevels([
      {
        level_name: "",
        level_description: "",
        state: true,
        level_cost: 0,
        material_cost: 0,
        level_modality: "In_person",
        level_duration: 1,
        groups: [{ group_name: "", schedule: "", group_teacher: "", start_date: "", end_date: "", state: true }],
      },
    ]);
  };

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
  }, [keycloak.token]);

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
    start_date: "",
    end_date: "",
    state: true,
    group_teacher: null,
  });

  const [creatingLevelForCourseId, setCreatingLevelForCourseId] = useState(null);
  const [newLevelGroup, setNewLevelGroup] = useState({
    level_name: "",
    level_description: "",
    level_cost: 0,
    material_cost: 0,
    level_modality: "In_person",
    level_duration: 1,
    group_name: "",
    schedule: "",
    state: true,
    group_teacher: null,
  });

  const handleStartCreatingLevel = (courseId) => {
    setCreatingLevelForCourseId(courseId);
    setNewLevelGroup({
      level_name: "",
      level_description: "",
      level_cost: 0,
      material_cost: 0,
      level_modality: "In_person",
      level_duration: 1,
      group_name: "",
      schedule: "",
      start_date: "",
      end_date: "",
      state: true,
      group_teacher: null,
    });
  };

  const handleCancelCreatingLevel = () => {
    setCreatingLevelForCourseId(null);
    setNewLevelGroup({
      level_name: "",
      level_description: "",
      level_cost: 0,
      material_cost: 0,
      level_modality: "In_person",
      level_duration: 1,
      group_name: "",
      start_date: "",
      end_date: "",
      schedule: "",
      state: true,
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
        level_cost: newLevelGroup.level_cost,
        material_cost: newLevelGroup.material_cost,
        level_modality: newLevelGroup.level_modality,
        level_duration: newLevelGroup.level_duration,
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
          start_date: newLevelGroup.start_date,
          end_date: newLevelGroup.end_date,
          state: true,
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
              <ToastContainer position="bottom-end" className="p-3">
                <Toast
                  show={message.show}
                  onClose={handleCloseToast}
                  delay={3000}
                  autohide
                  className={`border-0 shadow-lg rounded-3 bg-${message.type} position-relative`}
                  style={{
                    minHeight: "80px",
                  }}
                >
                  <Toast.Body className="text-white px-4 py-3 fs-6 w-100" style={{ fontSize: "1rem" }}>
                    {message.text}
                  </Toast.Body>
                </Toast>
                <style>{`@media (min-width: 768px) {.toast {max-width: 400px;}.toast-body {font-size: 1.25rem;}}`}</style>
              </ToastContainer>
            )}
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* FORMULARIO PRINCIPAL */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Nombre del Curso</label>
                    <input type="text" name="course_name" className="form-control border-secondary" value={courseForm.course_name} onChange={handleInputChange} required />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">{courseForm.course_type === "SKILLS" ? "Habilidades del Curso" : "Descripción del Curso"}</label>
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
                          {levels.length > 1 && (
                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveLevel(levelIndex)}>
                              Eliminar Nivel
                            </button>
                          )}
                        </div>

                        {/* Campos del Nivel */}
                        <div className="mb-2">
                          <label className="form-label">Nombre del Nivel</label>
                          <input type="text" name="level_name" className="form-control" value={level.level_name} onChange={(e) => handleLevelChange(e, levelIndex)} required />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Descripción del Nivel</label>
                          <textarea name="level_description" className="form-control" rows="2" value={level.level_description} onChange={(e) => handleLevelChange(e, levelIndex)} required></textarea>
                        </div>
                        <div className="row mb-2">
                          <div className="col-md-6">
                            <label className="form-label">Costo de Matricula</label>
                            <input type="number" name="level_cost" className="form-control" value={level.level_cost} onChange={(e) => handleLevelChange(e, levelIndex)} min="0" max="9999999" required />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Costo de Materiales</label>
                            <input type="number" name="material_cost" className="form-control" value={level.material_cost} onChange={(e) => handleLevelChange(e, levelIndex)} min="0" max="9999999" required />
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-md-6">
                            <label className="form-label">Modalidad</label>
                            <select name="level_modality" className="form-select border-secondary" value={level.level_modality} onChange={(e) => handleLevelChange(e, levelIndex)} required>
                              <option value="In_person">Presencial</option>
                              <option value="virtual">Virtual</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Duración del Nivel (horas)</label>
                            <input type="number" name="level_duration" className="form-control" value={level.level_duration} min="1" max="9999999" onChange={(e) => handleLevelChange(e, levelIndex)} required />
                          </div>
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
                                  <input type="date" name="start_date" className="form-control" value={group.start_date || ""} onChange={(e) => handleGroupChange(e, levelIndex, groupIndex)} required />
                                </div>
                                <div className="col">
                                  <label className="form-label">Fecha de Fin</label>
                                  <input type="date" name="end_date" className="form-control" value={group.end_date || ""} min={group.start_date || ""} onChange={(e) => handleGroupChange(e, levelIndex, groupIndex)} required />
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
                <button type="submit" className="btn btn-warning fw-bold shadow">
                  Crear Curso
                </button>
              </div>
            </form>
          </div>
        );
      case "ver":
        const handleDeleteCourse = async (courseId) => {
          try {
            await deleteCourse(courseId, keycloak.token);
            setGroupData((prev) => prev.filter((g) => g.level_id.id_course.id_course !== courseId));
            setMessage({ type: "success", text: "Curso Eliminado Correctamente." });
          } catch (err) {
            console.error("Error eliminando curso:", err);
            setMessage({ type: "danger", text: "Hubo un error, contacte a un administrador." });
          }
        };

        const handleDeleteLevel = async (levelId) => {
          try {
            await deleteLevel(levelId, keycloak.token);
            setGroupData((prev) => prev.filter((g) => g.level_id.level_id !== levelId));
            setMessage({ type: "success", text: "Nivel Eliminado Correctamente." });
          } catch (err) {
            console.error("Error eliminando nivel:", err);
            setMessage({ type: "danger", text: "Hubo un error, contacte a un administrador." });
          }
        };

        const handleDeleteGroup = async (groupId) => {
          try {
            await deleteGroup(groupId, keycloak.token);
            setGroupData((prev) => prev.filter((g) => g.group_id !== groupId));
            setMessage({ type: "success", text: "Grupo Eliminado Correctamente." });
          } catch (err) {
            console.error("Error eliminando grupo:", err);
            setMessage({ type: "danger", text: "Hubo un error, contacte a un administrador." });
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
          setExpandedLevelId(level.level_id);
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
          const { course_name, course_description, language, course_type } = editedCourse;

          if (!course_name?.trim() || !course_description?.trim() || !language?.trim() || !course_type) {
            setMessage({
              type: "danger",
              text: "Por favor, completa todos los campos del curso antes de guardar.",
            });
            return;
          }

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
            setMessage({ type: "success", text: "Curso Actualizado Correctamente" });
          } catch (err) {
            setMessage({ type: "danger", text: "Hubo un error, contacte a un administrador." });
          }
        };

        const handleSaveLevel = async () => {
          const { level_name, level_description, level_cost, material_cost, level_modality, level_duration } = editedLevel;

          if (!level_name?.trim() || !level_description?.trim() || level_cost === "" || material_cost === "" || !level_modality || level_duration === "") {
            setMessage({
              type: "danger",
              text: "Por favor, completa todos los campos del nivel antes de guardar.",
            });
            return;
          }
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
            console.log(editedLevel);
            console.log(updated);
            setMessage({ type: "success", text: "Nivel Actualizado Correctamente." });
          } catch (err) {
            console.error("Error actualizando nivel:", err);
            setMessage({ type: "danger", text: "Hubo un error, contacte a un administrador." });
          }
        };

        const handleSaveGroup = async () => {
          const { group_name, group_teacher, schedule, start_date, end_date } = editedGroup;
          if (!group_name?.trim() || !group_teacher || !schedule?.trim() || !start_date || !end_date) {
            setMessage({
              type: "danger",
              text: "Por favor, completa todos los campos del grupo antes de guardar.",
            });
            return;
          }

          if (new Date(start_date) > new Date(end_date)) {
            setMessage({
              type: "danger",
              text: "La fecha de inicio no puede ser posterior a la fecha de fin.",
            });
            return;
          }
          try {
            await updateGroup(editedGroup, keycloak.token);
            const updated = groupData.map((g) => (g.group_id === editedGroup.group_id ? editedGroup : g));
            setGroupData(updated);
            handleCancelEdit();
            setMessage({ type: "success", text: "Grupo actualizado Correctamente." });
          } catch (err) {
            console.error("Error actualizando grupo:", err);
            setMessage({ type: "danger", text: "Hubo un error, contacte a un administrador." });
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
          backgroundColor: "inherit",
          border: "none",
          boxShadow: "none",
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
            start_date: "",
            end_date: "",
            state: true,
          });
        };

        const handleCancelCreatingGroup = () => {
          setCreatingGroupForLevelId(null);
          setNewGroup({
            group_name: "",
            schedule: "",
            group_teacher: null,
            start_date: "",
            end_date: "",
            state: true,
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
            setMessage({ type: "success", text: "Grupo Guardado Correctamente." });
          } catch (err) {
            console.error("Error creando grupo:", err);
            setMessage({ type: "danger", text: "Hubo un error, contacte a un administrador." });
          }
        };

        return (
          <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="input-group w-50">
                <input type="text" className="form-control" placeholder="Buscar curso por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="form-check ms-3">
                <input className="form-check-input" type="checkbox" id="showFinishedGroups" checked={showFinishedGroups} onChange={() => setShowFinishedGroups(!showFinishedGroups)} />
                <label className="form-check-label" htmlFor="showFinishedGroups">
                  Mostrar grupos finalizados
                </label>
              </div>
            </div>
            {message.text && (
              <ToastContainer
                className="p-3"
                style={{
                  position: "fixed",
                  bottom: "1rem",
                  right: "1rem",
                  zIndex: 900,
                }}
              >
                <Toast show={message.show} onClose={handleCloseToast} delay={3000} autohide className={`border-0 shadow-lg rounded-3 bg-${message.type} position-relative`} style={{ minHeight: "80px" }}>
                  <Toast.Body className="text-white px-4 py-3 fs-6 w-100" style={{ fontSize: "1rem" }}>
                    {message.text}
                  </Toast.Body>
                </Toast>

                <style>{`
                  @media (min-width: 768px) {
                    .toast { max-width: 400px; }
                    .toast-body { font-size: 1.25rem; }
                  }
                `}</style>
              </ToastContainer>
            )}
            {Object.values(groupedCourses)
              .filter(({ course }) => course.course_name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(({ course, levels }) => (
                <div key={course.id_course} className="mb-4">
                  <div className="card shadow-sm">
                    <div className="card-header bg-warning text-white d-flex justify-content-between align-items-center">
                      {editingCourseId === course.id_course ? (
                        <div className="mb-2">
                          <label htmlFor="course_name" className="form-label small text-muted">
                            Nombre del Curso
                          </label>
                          <input id="course_name" name="course_name" value={editedCourse.course_name} onChange={handleCourseChange} className="form-control me-2" />
                        </div>
                      ) : (
                        <h5 className="mb-0">{course.course_name}</h5>
                      )}
                      <div className="d-flex">
                        {editingCourseId === course.id_course ? (
                          <>
                            <button
                              className="btn btn-sm btn-success me-2"
                              onClick={() =>
                                openConfirmModal(
                                  () => handleSaveCourse(),
                                  <>
                                    Esta accion podria afectara la informacion que tengan los certificados de los estudiantes relacionados al Curso.
                                    <br />
                                    Se recomienda crear un curso nuevo en vez de modificar uno ya existente.
                                  </>
                                )
                              }
                            >
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
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                openConfirmModal(
                                  () => handleDeleteCourse(course.id_course),
                                  <>
                                    ¿Estás seguro de que quieres eliminar el curso "<strong>{course.course_name}</strong>"?
                                    <br />
                                    Esta no afectará ni eliminará a los estudiantes ya finalizaron alguno de los niveles de este curso.
                                  </>
                                )
                              }
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="card-body">
                      {editingCourseId === course.id_course ? (
                        <>
                          <div className="mb-2">
                            <label htmlFor="course_description" className="form-label small text-muted">
                              Descripción del curso
                            </label>
                            <input type="text" id="course_description" className="form-control" name="course_description" value={editedCourse.course_description} onChange={handleCourseChange} />
                          </div>

                          <div className="mb-2">
                            <label htmlFor="language" className="form-label small text-muted">
                              Idioma
                            </label>
                            <input type="text" id="language" className="form-control" name="language" value={editedCourse.language} onChange={handleCourseChange} />
                          </div>
                          <div className="mb-2">
                            <label className="form-label small text-muted">Tipo de Curso</label>
                            <select name="course_type" className="form-select border-secondary" value={editedCourse.course_type} onChange={handleCourseChange} required>
                              <option value="DEFAULT">Normal</option>
                              <option value="KIDS">Niños</option>
                              <option value="SKILLS">Curso con Habilidades</option>
                            </select>
                          </div>
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

                          const levelsInSameCourse = Object.values(levels).filter(({ level: lvl }) => lvl.id_course.id_course === course.id_course);
                          const isOnlyLevelInCourse = levelsInSameCourse.length === 1;

                          return (
                            <div key={level.level_id} className="accordion-item">
                              <h2 className="accordion-header d-flex justify-content-between align-items-center" id={`heading-${level.level_id}`}>
                                <button
                                  className="accordion-button d-flex justify-content-between align-items-center"
                                  type="button"
                                  {...(!isEditing && {
                                    "data-bs-toggle": "collapse",
                                    "data-bs-target": `#collapse-${level.level_id}`,
                                  })}
                                  aria-expanded={isExpanded}
                                  aria-controls={`collapse-${level.level_id}`}
                                  onClick={(e) => {
                                    if (isEditing) {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      return;
                                    } else setExpandedLevelId(level.level_id);
                                  }}
                                  style={accordionButtonStyle}
                                >
                                  {isEditing ? (
                                    <div className="w-100 d-flex flex-wrap gap-2">
                                      <div className="flex-fill">
                                        <label htmlFor="level_name" className="form-label small text-muted">
                                          Nombre del nivel
                                        </label>
                                        <input type="text" id="level_name" className="form-control" name="level_name" value={editedLevel.level_name} onChange={handleLevel} />
                                      </div>

                                      <div className="flex-fill">
                                        <label htmlFor="level_cost" className="form-label small text-muted">
                                          Costo del nivel
                                        </label>
                                        <input type="number" id="level_cost" className="form-control" name="level_cost" value={editedLevel.level_cost} min="0" max="9999999" onChange={handleLevel} />
                                      </div>

                                      <div className="flex-fill">
                                        <label htmlFor="material_cost" className="form-label small text-muted">
                                          Costo del material
                                        </label>
                                        <input type="number" id="material_cost" className="form-control" name="material_cost" value={editedLevel.material_cost} min="0" max="9999999" onChange={handleLevel} />
                                      </div>

                                      <div className="flex-fill">
                                        <label htmlFor="level_modality" className="form-label small text-muted">
                                          Modalidad
                                        </label>
                                        <select id="level_modality" className="form-select" name="level_modality" value={editedLevel.level_modality} onChange={handleLevel}>
                                          <option value="In_person">Presencial</option>
                                          <option value="virtual">Virtual</option>
                                        </select>
                                      </div>
                                      <div className="flex-fill">
                                        <label htmlFor="level_duration" className="form-label small text-muted">
                                          Duración del nivel (horas)
                                        </label>
                                        <input type="number" id="level_duration" className="form-control" name="level_duration" value={editedLevel.level_duration} min="1" max="9999999" onChange={handleLevel} />
                                      </div>
                                      <div className="flex-fill">
                                        <label htmlFor="level_description" className="form-label small text-muted">
                                          Descripción del nivel
                                        </label>
                                        <textarea type="text" id="level_description" className="form-control" name="level_description" value={editedLevel.level_description} onChange={handleLevel} />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="container mb-3">
                                      <div className="row">
                                        <div className="col-md-6">
                                          <strong>Nombre:</strong> {level.level_name}
                                        </div>
                                        <div className="col-md-6">
                                          <strong>Descripción:</strong> {level.level_description}
                                        </div>
                                      </div>
                                      <div className="row mt-1">
                                        <div className="col-md-6">
                                          <strong>Costo del nivel:</strong> ${level.level_cost}
                                        </div>
                                        <div className="col-md-6">
                                          <strong>Costo del material:</strong> ${level.material_cost}
                                        </div>
                                      </div>
                                      <div className="row mt-1">
                                        <div className="col-md-6">
                                          <strong>Modalidad:</strong> {level.level_modality === "In_person" ? "Presencial" : "Virtual"}
                                        </div>
                                        <div className="col-md-6">
                                          <strong>Duración del Nivel:</strong> {level.level_duration} horas.
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </button>
                                <div className="d-flex me-3">
                                  {isEditing ? (
                                    <>
                                      <button className="btn btn-sm btn-success me-2" onClick={() => openConfirmModal(() => handleSaveLevel(), <>Esta accion podria afectar a los estudiantes que ya finalizaron el nivel.</>)}>
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
                                        <button
                                          className="btn btn-sm btn-danger me-2"
                                          onClick={() =>
                                            openConfirmModal(
                                              () => handleDeleteLevel(level.level_id),
                                              <>
                                                ¿Estás seguro de que quieres eliminar el nivel "${level.level_name}"?
                                                <br />
                                                Esto no afectará ni eliminará a los estudiantes que ya finalizaron el nivel.
                                              </>
                                            )
                                          }
                                        >
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
                                      .filter((group) => group.level_id.level_id === level.level_id &&
                                      (showFinishedGroups || new Date(group.end_date) >= new Date())
                                    )
                                      .map((group) => {
                                        const groupsInSameLevel = groups.filter((g) => g.level_id.level_id === level.level_id);
                                        const isOnlyGroupInLevel = groupsInSameLevel.length === 1;
                                        return (
                                          <div key={group.group_id} className="card mb-3">
                                            <div className="card-header d-flex justify-content-between align-items-center">
                                              <h5 className="mb-0">Grupo: {group.group_name}</h5>
                                              {new Date(group.end_date) < new Date() && <span className="badge bg-danger ms-2"> - Finalizado</span>}
                                              <div>
                                                {editingGroupId === group.group_id ? (
                                                  <>
                                                    <button
                                                      className="btn btn-sm btn-success me-2"
                                                      onClick={() =>
                                                        openConfirmModal(
                                                          () => handleSaveGroup(),
                                                          <>
                                                            Esta accion podria afectara a los estudiantes relacionados.
                                                            <br />
                                                            Modificar las fechas solamente afectará a los estudiantes que no hayan finalizado el grupo.
                                                          </>
                                                        )
                                                      }
                                                    >
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
                                                      <button
                                                        className="btn btn-sm btn-danger me-2"
                                                        onClick={() =>
                                                          openConfirmModal(
                                                            () => handleDeleteGroup(group.group_id),
                                                            <>
                                                              ¿Estás seguro de que quieres eliminar el grupo "${group.group_name}"?
                                                              <br />
                                                              Esta accion anulará la inscripción de todos los estudiantes actuales.
                                                            </>
                                                          )
                                                        }
                                                      >
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
                                                  <div className="mb-3">
                                                    <label htmlFor="start_date" className="form-label">
                                                      Fecha de inicio
                                                    </label>
                                                    <input type="date" id="start_date" className="form-control" name="start_date" value={editedGroup.start_date?.slice(0, 10) || ""} onChange={handleGroup} />
                                                  </div>

                                                  <div className="mb-3">
                                                    <label htmlFor="end_date" className="form-label">
                                                      Fecha de finalización
                                                    </label>
                                                    <input type="date" id="end_date" className="form-control" name="end_date" value={editedGroup.end_date?.slice(0, 10) || ""} min={editedGroup.start_date?.slice(0, 10) || ""} onChange={handleGroup} />
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="row">
                                                  <div className="col-md-6">
                                                    <p>
                                                      <strong>Horario:</strong> {group.schedule}
                                                    </p>
                                                    <p>
                                                      <strong>Profesor:</strong> {group.group_teacher ? `${group.group_teacher.firstName} ${group.group_teacher.lastName}` : "No asignado"}
                                                    </p>
                                                  </div>
                                                  <div className="col-md-6">
                                                    <p>
                                                      <strong>Fecha de inicio:</strong> {new Date(group.start_date).toLocaleDateString("es-ES")}
                                                    </p>
                                                    <p>
                                                      <strong>Fecha de finalización:</strong> {new Date(group.end_date).toLocaleDateString("es-ES")}
                                                    </p>
                                                  </div>
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
                                          <div className="mb-3">
                                            <label htmlFor="start_date" className="form-label">
                                              Fecha de inicio
                                            </label>
                                            <input type="date" id="start_date" className="form-control" name="start_date" value={newGroup.start_date?.slice(0, 10) || ""} onChange={handleNewGroupChange} />
                                          </div>

                                          <div className="mb-3">
                                            <label htmlFor="end_date" className="form-label">
                                              Fecha de finalización
                                            </label>
                                            <input type="date" id="end_date" className="form-control" name="end_date" value={newGroup.end_date?.slice(0, 10) || ""} min={newGroup.start_date?.slice(0, 10) || ""} onChange={handleNewGroupChange} />
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
                            <div className="mb-3">
                              <label htmlFor="level_cost" className="form-label small text-muted">
                                Costo del nivel
                              </label>
                              <input type="number" id="level_cost" className="form-control" name="level_cost" value={newLevelGroup.level_cost} min="0" max="9999999" onChange={handleNewLevelGroupChange} />
                            </div>
                            <div className="mb-3">
                              <label htmlFor="material_cost" className="form-label small text-muted">
                                Costo del material
                              </label>
                              <input type="number" id="material_cost" className="form-control" name="material_cost" value={newLevelGroup.material_cost} min="0" max="9999999" onChange={handleNewLevelGroupChange} />
                            </div>

                            <div className="mb-3">
                              <label htmlFor="level_modality" className="form-label small text-muted">
                                Modalidad
                              </label>
                              <select id="level_modality" className="form-select" name="level_modality" value={newLevelGroup.level_modality} onChange={handleNewLevelGroupChange}>
                                <option value="In_person">Presencial</option>
                                <option value="virtual">Virtual</option>
                              </select>
                            </div>
                            <div className="mb-3">
                              <label htmlFor="level_duration" className="form-label small text-muted">
                                Duración del nivel (horas)
                              </label>
                              <input type="number" id="level_duration" className="form-control" name="level_duration" value={newLevelGroup.level_duration} min="1" max="9999999" onChange={handleNewLevelGroupChange} />
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
                            <div className="mb-3">
                              <label htmlFor="start_date" className="form-label">
                                Fecha de inicio
                              </label>
                              <input type="date" id="start_date" className="form-control" name="start_date" value={newLevelGroup.start_date?.slice(0, 10) || ""} onChange={handleNewLevelGroupChange} />
                            </div>

                            <div className="mb-3">
                              <label htmlFor="end_date" className="form-label">
                                Fecha de finalización
                              </label>
                              <input type="date" id="end_date" className="form-control" name="end_date" value={newLevelGroup.end_date?.slice(0, 10) || ""} min={newLevelGroup.start_date?.slice(0, 10) || ""} onChange={handleNewLevelGroupChange} />
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
            {isModalOpen && (
              <ModalConfirm
                message={modalMessage}
                onConfirm={() => {
                  confirmAction();
                  closeConfirmModal();
                }}
                onCancel={closeConfirmModal}
              />
            )}
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
          <button key={tabName} className={`me-2 border-bottom-0 px-4 py-2 ${tab === tabName ? "bg-warning fw-semibold text-dark" : "bg-secondary"}`} onClick={() => setTab(tabName)}>
            {tabName.charAt(0).toUpperCase() + tabName.slice(1)} Cursos
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
};

export default Cursos;
