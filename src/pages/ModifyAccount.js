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

          // Cargar imagen de perfil si existe
          const imageUrl = await getProfileImage(keycloak.token);
          if (imageUrl) {
            setPreviewImageUrl(imageUrl);
          }
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

  const handleCancel = () => {
    window.history.back();
  };

  const handleSave = async () => {
    try {
      await modifyAccountInfo(editedUser);

      if (selectedImage) {
        await uploadProfileImage(selectedImage);
        const newImageUrl = URL.createObjectURL(selectedImage);
        setEditedUser(prev => ({ ...prev, profilePictureUrl: newImageUrl }));
        setPreviewImageUrl(newImageUrl);
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

  if (!editedUser) return <div className="text-center mt-4">Cargando...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Información Personal</h2>
      <div className="row bg-white p-4 rounded shadow">
        <div className="col-12 col-md-3 d-flex flex-column justify-content-center align-items-center mb-3 mb-md-0">
          <img
            src={previewImageUrl || editedUser.profilePictureUrl || '/profile-pic.png'}
            alt="Foto de perfil"
            className="img-fluid rounded shadow mb-2"
            style={{ width: '160px', height: '160px', objectFit: 'cover' }}
          />

          <div className="mt-2">
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

        <div className="col-12 col-md-9">
          <div className="row">
            <div className="col-12 col-md-6 mb-3">
              <label className="form-label">Nombres</label>
              <input type="text" className="form-control" name="firstName" value={editedUser.firstName || ''} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-6 mb-3">
              <label className="form-label">Apellidos</label>
              <input type="text" className="form-control" name="lastName" value={editedUser.lastName || ''} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-6 mb-3">
              <label className="form-label">Tipo de documento</label>
              <select className="form-select" name="documentType" value={editedUser.documentType || ''} onChange={handleChange}>
                <option value="CC">CC</option>
                <option value="TI">TI</option>
              </select>
            </div>
            <div className="col-12 col-md-6 mb-3">
              <label className="form-label">Documento</label>
              <input type="text" className="form-control" name="document" value={editedUser.document || ''} disabled />
            </div>
            <div className="col-12 col-md-6 mb-3">
              <label className="form-label">Correo</label>
              <input type="email" className="form-control" name="email" value={editedUser.email || ''} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-6 mb-3">
              <label className="form-label">Celular</label>
              <input type="text" className="form-control" name="phone" value={editedUser.phone || ''} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-6 mb-3">
              <label className="form-label">Fecha de nacimiento</label>
              <input type="date" className="form-control" name="birthDate" value={editedUser.birthDate ? editedUser.birthDate.split('T')[0] : ''} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-secondary me-2" onClick={handleCancel}>Cancelar</button>
        <button className="btn btn-warning fw-bold shadow" onClick={() => openConfirmModal(() => handleSave(), "¿Está seguro que desea guardar los cambios?")}>Guardar Cambios</button>
      </div>

      {showNotification && (
        <div className="alert alert-success mt-3" role="alert" >
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
