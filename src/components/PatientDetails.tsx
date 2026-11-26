import { toast } from 'react-toastify'
import type { Patient } from "../types"
import { usePatientStore } from "../store"
import { EditIcon, TrashIcon } from './Icons'

type PatientDetailsProps = {
  patient: Patient
}

const tints = [
  { bg: 'bg-[#ffd9cc]', ink: 'text-[#b8361f]' },
  { bg: 'bg-[#d4ecdc]', ink: 'text-[#24704f]' },
  { bg: 'bg-[#d9e2ff]', ink: 'text-[#3049b8]' },
  { bg: 'bg-[#ffe8b3]', ink: 'text-[#8a5a00]' },
  { bg: 'bg-[#ecdcf5]', ink: 'text-[#7a2e99]' },
]

const tintFor = (id: string) => {
  let hash = 0
  for (const char of id) hash = (hash + char.charCodeAt(0)) % tints.length
  return tints[hash]
}

const formatDate = (date: Patient['date']) => {
  const value = new Date(`${String(date)}T00:00:00`)
  if (Number.isNaN(value.getTime())) return String(date)
  return value.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PatientDetails({ patient }: PatientDetailsProps) {

  const deletePatient = usePatientStore((state) => state.deletePatient)
  const getPatientById = usePatientStore((state) => state.getPatientById)
  const activeId = usePatientStore((state) => state.activeId)

  const isEditing = activeId === patient.id
  const tint = tintFor(patient.id)

  const handleClick = () => {
    deletePatient(patient.id)
    toast('Paciente Eliminado', {
      type: 'error'
    })
  }

  const handleEdit = () => {
    getPatientById(patient.id)
    document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_2px_0_var(--color-line)] transition-shadow ${
        isEditing ? 'ring-[3px] ring-brand' : ''
      }`}
    >
      <div className={`relative flex h-28 items-end px-5 ${tint.bg}`}>
        <span className="absolute top-3.5 right-3.5 rounded-full bg-white px-3 py-1 text-[13px] font-extrabold">
          Alta {formatDate(patient.date)}
        </span>
        {isEditing && (
          <span className="absolute top-3.5 left-3.5 rounded-full bg-brand px-3 py-1 text-[13px] font-extrabold text-white">
            Editando
          </span>
        )}
        <div
          className={`-mb-7 flex size-[76px] items-center justify-center rounded-[40%_60%_55%_45%/50%_45%_55%_50%] border-4 border-white bg-white text-[34px] font-black shadow-[0_4px_12px_rgba(43,29,24,.1)] ${tint.ink}`}
          aria-hidden="true"
        >
          {patient.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-5 pt-10 pb-5">
        <h3 className="text-2xl font-black break-words">{patient.name}</h3>
        <p className="text-[15px] text-muted-dark break-words">
          <span className="font-bold">{patient.caretaker}</span> · {patient.email}
        </p>
        <p className="mt-1 flex-1 text-[15px] leading-relaxed text-ink-soft break-words">{patient.symptoms}</p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="truncate font-mono text-xs text-muted" title={patient.id}>
            #{patient.id.slice(0, 8)}
          </span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label={`Editar ${patient.name}`}
              title="Editar"
              onClick={handleEdit}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-line bg-white text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              aria-label={`Eliminar ${patient.name}`}
              title="Eliminar"
              onClick={handleClick}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-danger-line bg-danger-soft text-brand-dark transition-colors hover:border-brand-dark hover:bg-[#ffe3dc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
