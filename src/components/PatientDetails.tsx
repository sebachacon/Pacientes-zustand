import { useState } from 'react'
import { toast } from 'react-toastify'
import { SPECIES_LABEL, type Patient } from "../types"
import { usePatientStore } from "../store"
import { useCan } from '../hooks/useUser'
import { BellIcon, ChatIcon, CheckIcon, EditIcon, PhoneIcon, TrashIcon } from './Icons'
import ConfirmDialog from './ConfirmDialog'
import { formatDate } from '../utils/date'
import { formatAge, formatWeight, initialOf, tintFor } from '../utils/patient'
import { telUrl, whatsappUrl } from '../utils/contact'
import { chip, iconBtn, iconBtnDanger } from './ui'

type PatientDetailsProps = {
  patient: Patient
  pendingReminders: number
  onEdit: (id: Patient['id']) => void
}

export default function PatientDetails({ patient, pendingReminders, onEdit }: PatientDetailsProps) {

  const deletePatient = usePatientStore((state) => state.deletePatient)
  const openDetail = usePatientStore((state) => state.openDetail)
  const activeId = usePatientStore((state) => state.activeId)
  const canDelete = useCan('deletePatient')

  const [confirmOpen, setConfirmOpen] = useState(false)

  const isEditing = activeId === patient.id
  const tint = tintFor(patient.id)
  const details = [
    patient.breed,
    formatAge(patient.age),
    formatWeight(patient.weight),
  ].filter(Boolean)

  const handleDelete = async () => {
    setConfirmOpen(false)
    if (!await deletePatient(patient.id)) return
    toast('Paciente Eliminado', {
      type: 'error'
    })
  }

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_2px_0_var(--color-line)] transition-shadow ${
        isEditing ? 'ring-[3px] ring-brand' : ''
      }`}
    >
      <div className={`relative flex h-28 items-end px-5 ${tint.bg}`}>
        <span className="absolute top-3.5 right-3.5 rounded-full bg-white px-3 py-1 text-[13px] font-extrabold">
          Ingreso {formatDate(patient.date)}
        </span>
        <div className="absolute top-3.5 left-3.5 flex gap-1.5">
          {isEditing ? (
            <span className="rounded-full bg-brand px-3 py-1 text-[13px] font-extrabold text-white">Editando</span>
          ) : (
            <span className="rounded-full bg-white/80 px-3 py-1 text-[13px] font-extrabold">{SPECIES_LABEL[patient.species]}</span>
          )}
        </div>
        <div
          className={`-mb-7 flex size-[76px] items-center justify-center rounded-[40%_60%_55%_45%/50%_45%_55%_50%] border-4 border-white bg-white text-[34px] font-black shadow-[0_4px_12px_rgba(43,29,24,.1)] ${tint.ink}`}
          aria-hidden="true"
        >
          {initialOf(patient)}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-5 pt-10 pb-5">
        <div>
          <h3 className="text-2xl font-black break-words">{patient.name}</h3>
          {details.length > 0 && (
            <p className="text-sm font-semibold text-muted-dark">{details.join(' · ')}</p>
          )}
        </div>

        <p className="text-[15px] text-muted-dark break-words">
          <span className="font-bold">{patient.caretaker}</span> · {patient.email}
        </p>

        <p className="mt-1 line-clamp-3 flex-1 text-[15px] leading-relaxed text-ink-soft break-words">{patient.symptoms}</p>

        {patient.dischargeDate && (
          <span className={`${chip} self-start bg-[#d4ecdc] text-[#1d5c40]`}>
            <CheckIcon className="size-3.5" />
            De alta el {formatDate(patient.dischargeDate)}
          </span>
        )}

        {pendingReminders > 0 && (
          <span className={`${chip} self-start bg-[#ffe8b3] text-[#6b4500]`}>
            <BellIcon className="size-3.5" />
            {pendingReminders} {pendingReminders === 1 ? 'recordatorio próximo' : 'recordatorios próximos'}
          </span>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => openDetail(patient.id)}
            className="min-h-11 cursor-pointer rounded-full px-1 font-extrabold text-brand-dark underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand"
          >
            Ver ficha
          </button>
          <div className="flex shrink-0 gap-2">
            {patient.phone && (
              <>
                <a href={telUrl(patient.phone)} aria-label={`Llamar a ${patient.caretaker}`} title="Llamar" className={iconBtn}>
                  <PhoneIcon />
                </a>
                <a href={whatsappUrl(patient.phone)} target="_blank" rel="noreferrer" aria-label={`Escribir por WhatsApp a ${patient.caretaker}`} title="WhatsApp" className={iconBtn}>
                  <ChatIcon />
                </a>
              </>
            )}
            <button
              type="button"
              aria-label={`Editar ${patient.name}`}
              title="Editar"
              onClick={() => onEdit(patient.id)}
              className={iconBtn}
            >
              <EditIcon />
            </button>
            {canDelete && (
              <button
                type="button"
                aria-label={`Eliminar ${patient.name}`}
                title="Eliminar"
                onClick={() => setConfirmOpen(true)}
                className={iconBtnDanger}
              >
                <TrashIcon />
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`¿Eliminar a ${patient.name}?`}
        message={<>Se borrarán su ficha, su historial de consultas, sus citas y sus recordatorios. Esta acción no se puede deshacer.</>}
        confirmLabel="Sí, eliminar"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  )
}
