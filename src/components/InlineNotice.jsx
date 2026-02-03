export default function InlineNotice({
  type = "info",
  title,
  message,
  onClose,
  actions = [],
}) {
  if (!title && !message) return null;

  const tone =
    type === "error"
      ? "error"
      : type === "success"
        ? "success"
        : type === "warning"
          ? "warning"
          : "info";

  return (
    <div className={`notice notice-${tone}`} role="status">
      <div className="notice-body">
        {title && <p className="notice-title">{title}</p>}
        {message && <p className="notice-message">{message}</p>}
      </div>
      {actions.length > 0 && (
        <div className="notice-actions">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="notice-action-btn"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      {onClose && (
        <button
          type="button"
          className="notice-close"
          aria-label="Dismiss"
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
}
