import { useState, useEffect, useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { createCourse, getAllCourses } from '../services/CourseService';
import img_languajes from '../assets/idiomas.png';

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

  const loadCourses = useCallback(async () => {
    try {
      const data = await getAllCourses(keycloak.token);
      setCourses(data);
    } catch (err) {
      console.error("Error cargando cursos:", err);
    }
  }, [keycloak.token]);

  useEffect(() => {
    if (tab === "ver" && keycloak?.authenticated) {
      loadCourses();
    }
  }, [tab, keycloak, loadCourses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = keycloak.token;
      await createCourse(courseForm, token);
      setMessage({ type: 'success', text: '✅ Curso creado exitosamente.' });

      setCourseForm({
        course_name: '',
        course_description: '',
        course_type: 'DEFAULT',
        language: '',
        creation_date: '',
      });
    } catch (error) {
      console.error('Error al crear el curso:', error);
      setMessage({ type: 'danger', text: '❌ Ocurrió un error al crear el curso.' });
    }

    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const renderTab = () => {
    switch (tab) {
      case "crear": 
        return (
          <div className="row">
            <div className="col-12 col-lg-6">
              <form className="bg-white text-dark p-4 rounded border border-2" onSubmit={handleSubmit}>
                <h3 className="text-warning mb-4">Crear Curso</h3>
        
                {/* Mensaje */}
                {message.text && (
                  <div className={`alert alert-${message.type} mt-2`} role="alert">
                    {message.text}
                  </div>
                )}
        
                <div className="mb-3">
                  <label className="form-label">Nombre del Curso</label>
                  <input
                    type="text"
                    name="course_name"
                    className="form-control border-warning"
                    value={courseForm.course_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
        
                <div className="mb-3">
                  <label className="form-label">Descripción del Curso</label>
                  <textarea
                    name="course_description"
                    className="form-control border-warning"
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
                    className="form-select border-warning"
                    value={courseForm.course_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="DEFAULT">Normal</option>
                    <option value="KIDS">Niños</option>
                  </select>
                  <div className="form-text text-muted">
                    Selecciona el tipo de curso que deseas crear.
                  </div>
                </div>
        
                <div className="mb-3">
                  <label className="form-label">Idioma</label>
                  <input
                    type="text"
                    name="language"
                    className="form-control border-warning"
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
                    className="form-control border-warning"
                    value={courseForm.creation_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
        
                <button type="submit" className="btn btn-warning fw-bold mt-3 shadow">
                  Crear Curso
                </button>
              </form>
            </div>
            <div className="col-lg-6 d-none d-lg-flex justify-content-center align-items-center">
              <img 
                src={img_languajes}
                alt="Curso" 
                className="img-fluid rounded"
                style={{ maxHeight: '500px', width: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        );
          

      case "ver":
        return (
          <table className="table-auto w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Nombre</th>
                <th className="border px-4 py-2">Descripción</th>
                <th className="border px-4 py-2">Tipo</th>
                <th className="border px-4 py-2">Idioma</th>
                <th className="border px-4 py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border px-4 py-2">{course.course_name}</td>
                  <td className="border px-4 py-2">{course.course_description}</td>
                  <td className="border px-4 py-2">{course.course_type}</td>
                  <td className="border px-4 py-2">{course.language}</td>
                  <td className="border px-4 py-2">{new Date(course.creation_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "modificar":
        return <div>Formulario para modificar cursos</div>;

      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="flex space-x-4 mb-4">
        {["crear", "modificar", "ver"].map(tabName => (
          <button
            key={tabName}
            className={`px-4 py-2 border rounded ${tab === tabName ? 'bg-yellow-300' : ''}`}
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
