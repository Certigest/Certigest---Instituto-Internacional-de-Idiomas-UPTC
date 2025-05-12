import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { getAccountInfo, modifyAccountInfo, uploadProfileImage, getProfileImage } from '../services/UserService';
import { useNavigate } from 'react-router-dom';
import ModalConfirm from '../components/ModalConfirm';

export default function Cuenta() {
  const { keycloak } = useKeycloak();
  const [editedUser, setEditedUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (keycloak?.authenticated) {
        try {
          const data = await getAccountInfo(keycloak.token);
          setEditedUser(data);
          const imageUrl = await getProfileImage(keycloak.token);
          if (imageUrl) setPreviewImageUrl(imageUrl);
        } catch (error) {
          console.error('Error al obtener la información de cuenta o imagen:', error);
        }
      }
    };

    fetchAccountInfo();
  }, [keycloak]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen excede el tamaño máximo permitido de 5MB');
        return;
      }
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        setPreviewImageUrl(URL.createObjectURL(file));
      }
    }
  };

  const validateFields = () => {
    const newErrors = {};

    if (!editedUser.firstName || /\d/.test(editedUser.firstName)) {
      newErrors.firstName = 'Nombres inválidos';
    }
    if (!editedUser.lastName || /\d/.test(editedUser.lastName)) {
      newErrors.lastName = 'Apellidos inválidos';
    }
    if (!editedUser.documentType) {
      newErrors.documentType = 'Seleccione un tipo de documento';
    }
    if (!editedUser.email || !/\S+@\S+\.\S+/.test(editedUser.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }
    if (!editedUser.phone || !/^\d{10}$/.test(editedUser.phone)) {
      newErrors.phone = 'Número de celular inválido';
    }
    if (!editedUser.birthDate) {
      newErrors.birthDate = 'Fecha de nacimiento requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) return;

    try {
      await modifyAccountInfo(editedUser);
      if (selectedImage) {
        await uploadProfileImage(selectedImage);
        setPreviewImageUrl(URL.createObjectURL(selectedImage));
      }

      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        navigate('/cuenta');
      }, 2000);
    } catch (err) {
      console.error('Error actualizando usuario o subiendo imagen:', err);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!editedUser) return <div className="text-center mt-4">Cargando...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Información Personal</h2>
      <div className="row bg-white p-4 rounded shadow">
        <div className="col-md-3 d-flex flex-column align-items-center justify-content-center text-center mb-3 mb-md-0">
          <img
            src={previewImageUrl || editedUser.profilePictureUrl || '/profile-pic.png'}
            alt="Foto de perfil"
            className="img-fluid rounded shadow mb-2"
            style={{ width: '160px', height: '160px', objectFit: 'cover' }}
          />
          <div>
            <label htmlFor="profileImage" className="btn btn-outline-warning btn-sm fw-bold shadow">
              Cambiar foto
            </label>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="col-md-9">
          <div className="row">
            {[
              { label: "Nombres", name: "firstName", type: "text", placeholder: "Ej: Juan", maxLength: 50 },
              { label: "Apellidos", name: "lastName", type: "text", placeholder: "Ej: Pérez", maxLength: 50 },
              {
                label: "Correo", name: "email", type: "email", placeholder: "correo@ejemplo.com"
              },
              {
                label: "Celular", name: "phone", type: "tel", placeholder: "Ej: 3001234567", maxLength: 10
              },
              {
                label: "Fecha de nacimiento", name: "birthDate", type: "date", max: new Date().toISOString().split('T')[0]
              }
            ].map(({ label, name, type, placeholder, ...props }) => (
              <div className="col-md-6 mb-3" key={name}>
                <label className="form-label">{label}</label>
                <input
                  type={type}
                  className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
                  name={name}
                  value={name === "birthDate" && editedUser[name] ? editedUser[name].split('T')[0] : editedUser[name] || ''}
                  onChange={handleChange}
                  placeholder={placeholder}
                  {...props}
                />
                {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
              </div>
            ))}

            <div className="col-md-6 mb-3">
              <label className="form-label">Tipo de documento</label>
              <select
                className={`form-select ${errors.documentType ? 'is-invalid' : ''}`}
                name="documentType"
                value={editedUser.documentType || ''}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                <option value="CC">Cédula de ciudadanía</option>
                <option value="TI">Tarjeta de identidad</option>
              </select>
              {errors.documentType && <div className="invalid-feedback">{errors.documentType}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Documento</label>
              <input
                type="text"
                className="form-control"
                name="document"
                value={editedUser.document || ''}
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-secondary me-2" onClick={handleCancel}>
          Cancelar
        </button>
        <button
          className="btn btn-warning fw-bold shadow"
          onClick={() => openConfirmModal(handleSave, "¿Está seguro que desea guardar los cambios?")}
        >
          Guardar Cambios
        </button>
      </div>

      {showNotification && (
        <div className="alert alert-success mt-3" role="alert">
          Cambios guardados
        </div>
      )}

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
}
