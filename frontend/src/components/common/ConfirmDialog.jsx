import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  description,
  confirmLabel = "Confirmar",
  isDanger = true,
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {description && (
        <p className="mb-5 text-sm text-[var(--color-text-secondary)]">{description}</p>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          isLoading={isLoading}
          className={isDanger ? "!bg-[var(--color-error)] hover:!bg-red-700" : ""}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
