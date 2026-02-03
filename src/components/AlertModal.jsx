import InlineNotice from "./InlineNotice";

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

  const actions = [];
  if (cancelText) {
    actions.push({ label: cancelText, onClick: onCancel });
  }
  if (confirmText) {
    actions.push({ label: confirmText, onClick: onConfirm });
  }

  return (
    <InlineNotice
      type={type}
      title={title}
      message={message}
      actions={actions}
    />
  );
}
