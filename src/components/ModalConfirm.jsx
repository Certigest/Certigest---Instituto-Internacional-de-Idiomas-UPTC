const ModalConfirm = ({ message, onConfirm, onCancel }) => {
  return (
    <div
      className="modal d-flex justify-content-center align-items-center"
      tabIndex="-1"
      style={{
        display: "block",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog" style={{ maxWidth: "500px" }}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">¿Estás Seguro?</h5>
            <button type="button" className="btn-close" onClick={onCancel} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={onConfirm}>
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirm;