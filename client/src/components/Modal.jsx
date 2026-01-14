const Modal = ({ title, onClose, children }) => (
  <div className="modal" role="dialog" aria-modal="true">
    <div className="modal__content">
      <div className="modal__header">
        <h3>{title}</h3>
        <button className="btn btn--ghost" onClick={onClose} type="button">
          Закрити
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Modal;
