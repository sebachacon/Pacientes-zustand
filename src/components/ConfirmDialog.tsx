import { useId } from 'react'
import Modal from './Modal'
import { btnDanger, btnGhost } from './ui'

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: React.ReactNode
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Eliminar', onConfirm, onCancel }: ConfirmDialogProps) {

  const titleId = useId()

  return (
    <Modal open={open} onClose={onCancel} labelledBy={titleId}>
      <div className="flex flex-col gap-4 p-7">
        <h2 id={titleId} className="text-2xl font-black">{title}</h2>
        <div className="text-muted-dark">{message}</div>
        <div className="mt-2 flex flex-wrap justify-end gap-3">
          <button type="button" className={btnGhost} onClick={onCancel}>Cancelar</button>
          <button type="button" className={btnDanger} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </Modal>
  )
}
