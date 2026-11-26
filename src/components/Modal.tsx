import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: React.ReactNode
  size?: 'sm' | 'lg'
}

export default function Modal({ open, onClose, labelledBy, children, size = 'sm' }: ModalProps) {

  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previousFocus?.focus?.()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 sm:items-center sm:p-6"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-cream shadow-2xl outline-none sm:rounded-[28px] ${
          size === 'lg' ? 'sm:max-w-4xl' : 'sm:max-w-md'
        }`}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}
