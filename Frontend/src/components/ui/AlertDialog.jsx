import React from "react"
import { AlertTriangle } from "lucide-react"
import { Modal } from "./Modal"
import { Button } from "./Button"

export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} className="max-w-md">
      <div className="flex flex-col items-center justify-center py-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${variant === 'danger' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
          <AlertTriangle className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="rounded-xl px-6"
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={loading}
          className="rounded-xl px-6"
        >
          {loading ? "Processing..." : confirmText}
        </Button>
      </div>
    </Modal>
  )
}
