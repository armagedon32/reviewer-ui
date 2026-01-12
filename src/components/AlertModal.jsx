export default function AlertModal({
  isOpen,
  title = "Notice",
  message,
  type = "success",
  confirmText = "OK",
  onConfirm = () => {},
  cancelText,
  onCancel = () => {},
}) {
  if (!isOpen) return null;

  const tone = type === "error" ? "error" : "success";

  return (
    <div className="alert-overlay">
      <div className="alert-modal">
        <div className={`alert-icon ${tone}`}>
          {tone === "error" ? "!" : "✓"}
        </div>
        <h3 className="alert-title">{title}</h3>
        <p className="alert-message">{message}</p>
        <div className="alert-actions">
          {cancelText && (
            <button className="alert-btn secondary" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button className={`alert-btn ${tone}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
