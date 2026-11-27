import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { usePatientStore } from '../store'
import { REMINDER_LABEL, type Appointment, type DraftAppointment, type DraftReminder, type Reminder, type ReminderType } from '../types'
import { daysUntil, formatDate, relativeDays } from '../utils/date'
import Error from './Error'
import { ClockIcon, EditIcon, TrashIcon } from './Icons'
import { btnDanger, btnGhost, btnPrimary, chip, iconBtn, iconBtnDanger, inputClass, labelClass } from './ui'

function PatientLink({ patientId }: { patientId: string }) {
  const patient = usePatientStore(state => state.patients.find(p => p.id === patientId))
  const openDetail = usePatientStore(state => state.openDetail)
  if (!patient) return <span className="text-muted">Paciente eliminado</span>
  return (
    <button
      type="button"
      onClick={() => openDetail(patient.id)}
      className="cursor-pointer text-left font-extrabold text-ink underline-offset-4 hover:text-brand-dark hover:underline"
    >
      {patient.name}
      <span className="font-semibold text-muted-dark"> · {patient.caretaker}</span>
    </button>
  )
}

function AppointmentEditForm({ appointment, canChangePatient, onDone }: {
  appointment: Appointment
  canChangePatient: boolean
  onDone: () => void
}) {
  const patients = usePatientStore(state => state.patients)
  const updateAppointment = usePatientStore(state => state.updateAppointment)
  const uid = useId()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...draft } = appointment
  const { register, handleSubmit, formState: { errors } } = useForm<DraftAppointment>({ defaultValues: draft })

  const onSubmit = async (data: DraftAppointment) => {
    if (!await updateAppointment(appointment.id, data)) return
    toast.success('Cita actualizada')
    onDone()
  }

  return (
    <li className="rounded-2xl bg-white p-4 text-ink shadow-[0_2px_0_var(--color-line)] ring-2 ring-brand">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-2" aria-label="Editar cita">
        {canChangePatient && (
          <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
            <label htmlFor={`${uid}-patient`} className={labelClass}>Paciente</label>
            <select
              id={`${uid}-patient`}
              className={`${inputClass(!!errors.patientId)} cursor-pointer`}
              {...register('patientId', { required: 'Elige un paciente' })}
            >
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name} · {patient.caretaker}</option>
              ))}
            </select>
            {errors.patientId && <Error>{errors.patientId.message}</Error>}
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={`${uid}-date`} className={labelClass}>Fecha</label>
          <input id={`${uid}-date`} type="date" className={inputClass(!!errors.date)} {...register('date', { required: 'La fecha es obligatoria' })} />
          {errors.date && <Error>{errors.date.message}</Error>}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={`${uid}-time`} className={labelClass}>Hora</label>
          <input id={`${uid}-time`} type="time" className={inputClass(!!errors.time)} {...register('time', { required: 'La hora es obligatoria' })} />
          {errors.time && <Error>{errors.time.message}</Error>}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
          <label htmlFor={`${uid}-reason`} className={labelClass}>Motivo</label>
          <input id={`${uid}-reason`} type="text" className={inputClass(!!errors.reason)} {...register('reason', { required: 'El motivo es obligatorio' })} />
          {errors.reason && <Error>{errors.reason.message}</Error>}
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="submit" className={btnPrimary}>Guardar cambios</button>
          <button type="button" className={btnGhost} onClick={onDone}>Cancelar</button>
        </div>
      </form>
    </li>
  )
}

export function AppointmentItem({ appointment, showPatient = true, showDate = true }: {
  appointment: Appointment
  showPatient?: boolean
  showDate?: boolean
}) {
  const deleteAppointment = usePatientStore(state => state.deleteAppointment)
  const [editing, setEditing] = useState(false)
  const days = daysUntil(appointment.date)
  const isPast = days < 0

  if (editing) {
    return <AppointmentEditForm appointment={appointment} canChangePatient={showPatient} onDone={() => setEditing(false)} />
  }

  return (
    <li className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-white p-4 shadow-[0_2px_0_var(--color-line)] ${isPast ? 'opacity-70' : ''}`}>
      <div className="flex min-w-0 flex-[1_1_14rem] items-center gap-4">
        <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-cream py-2">
          <ClockIcon className="size-4 text-muted" />
          <span className="text-lg font-black">{appointment.time}</span>
        </div>
        <div className="min-w-0 flex-1">
          {showPatient && <PatientLink patientId={appointment.patientId} />}
          <p className="break-words text-ink-soft">{appointment.reason}</p>
          {showDate && (
            <p className="text-sm font-semibold text-muted">
              {formatDate(appointment.date, { weekday: 'long', day: 'numeric', month: 'long' })} · {relativeDays(days)}
            </p>
          )}
        </div>
      </div>
      {/* Si no hay espacio, los botones bajan a su propia línea en lugar de aplastar el texto */}
      <div className="ml-auto flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Editar cita"
          title="Editar cita"
          className={iconBtn}
        >
          <EditIcon />
        </button>
        <button
          type="button"
          onClick={() => deleteAppointment(appointment.id)}
          aria-label="Cancelar cita"
          title="Cancelar cita"
          className={iconBtnDanger}
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  )
}

const reminderStatus = (reminder: Reminder) => {
  if (reminder.done) return { label: 'Completado', className: 'bg-[#d4ecdc] text-[#1d5c40]' }
  const days = daysUntil(reminder.dueDate)
  if (days < 0) return { label: `Vencido ${relativeDays(days)}`, className: 'bg-danger-soft text-brand-dark' }
  if (days <= 7) return { label: `Vence ${relativeDays(days)}`, className: 'bg-[#ffe8b3] text-[#6b4500]' }
  return { label: `Vence ${relativeDays(days)}`, className: 'bg-cream text-muted-dark' }
}

function ReminderEditForm({ reminder, canChangePatient, onDone }: {
  reminder: Reminder
  canChangePatient: boolean
  onDone: () => void
}) {
  const patients = usePatientStore(state => state.patients)
  const updateReminder = usePatientStore(state => state.updateReminder)
  const uid = useId()

  const { register, handleSubmit, formState: { errors } } = useForm<DraftReminder>({
    defaultValues: { patientId: reminder.patientId, type: reminder.type, name: reminder.name, dueDate: reminder.dueDate }
  })

  const onSubmit = async (data: DraftReminder) => {
    if (!await updateReminder(reminder.id, data)) return
    toast.success('Recordatorio actualizado')
    onDone()
  }

  return (
    <li className="rounded-2xl bg-white p-4 shadow-[0_2px_0_var(--color-line)] ring-2 ring-brand">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-2" aria-label="Editar recordatorio">
        {canChangePatient && (
          <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
            <label htmlFor={`${uid}-patient`} className={labelClass}>Paciente</label>
            <select id={`${uid}-patient`} className={`${inputClass(!!errors.patientId)} cursor-pointer`} {...register('patientId', { required: 'Elige un paciente' })}>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name} · {patient.caretaker}</option>
              ))}
            </select>
            {errors.patientId && <Error>{errors.patientId.message}</Error>}
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={`${uid}-type`} className={labelClass}>Tipo</label>
          <select id={`${uid}-type`} className={`${inputClass()} cursor-pointer`} {...register('type')}>
            {(Object.keys(REMINDER_LABEL) as ReminderType[]).map(type => (
              <option key={type} value={type}>{REMINDER_LABEL[type]}</option>
            ))}
          </select>
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={`${uid}-due`} className={labelClass}>Vence el</label>
          <input id={`${uid}-due`} type="date" className={inputClass(!!errors.dueDate)} {...register('dueDate', { required: 'La fecha es obligatoria' })} />
          {errors.dueDate && <Error>{errors.dueDate.message}</Error>}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
          <label htmlFor={`${uid}-name`} className={labelClass}>Detalle</label>
          <input id={`${uid}-name`} type="text" className={inputClass(!!errors.name)} {...register('name', { required: 'Indica qué vacuna o tratamiento es' })} />
          {errors.name && <Error>{errors.name.message}</Error>}
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="submit" className={btnPrimary}>Guardar cambios</button>
          <button type="button" className={btnGhost} onClick={onDone}>Cancelar</button>
        </div>
      </form>
    </li>
  )
}

export function ReminderItem({ reminder, showPatient = true }: { reminder: Reminder, showPatient?: boolean }) {
  const toggleReminder = usePatientStore(state => state.toggleReminder)
  const deleteReminder = usePatientStore(state => state.deleteReminder)
  const [mode, setMode] = useState<'view' | 'edit' | 'confirmDelete'>('view')
  const status = reminderStatus(reminder)
  const checkboxId = `reminder-${reminder.id}`

  if (mode === 'edit') {
    return <ReminderEditForm reminder={reminder} canChangePatient={showPatient} onDone={() => setMode('view')} />
  }

  const toggle = async () => {
    if (!await toggleReminder(reminder.id)) return
    toast.info(reminder.done ? 'Recordatorio marcado como pendiente' : 'Recordatorio marcado como hecho')
  }

  const remove = async () => {
    if (!await deleteReminder(reminder.id)) return
    toast('Recordatorio eliminado', { type: 'error' })
  }

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-white p-4 shadow-[0_2px_0_var(--color-line)]">
      <div className={`flex min-w-0 flex-[1_1_14rem] items-center gap-4 ${reminder.done ? 'opacity-75' : ''}`}>
        {/* La casilla marca el recordatorio como hecho (vacuna puesta / desparasitación aplicada) */}
        <label htmlFor={checkboxId} className="flex w-12 shrink-0 cursor-pointer flex-col items-center gap-1" title={reminder.done ? 'Marcar como pendiente' : 'Marcar como hecho'}>
          <input
            id={checkboxId}
            type="checkbox"
            checked={reminder.done}
            onChange={toggle}
            className="size-6 cursor-pointer accent-brand"
          />
          <span className="text-[11px] font-extrabold text-muted">{reminder.done ? 'Hecho' : 'Pendiente'}</span>
          <span className="sr-only">{`Marcar ${reminder.name} como ${reminder.done ? 'pendiente' : 'hecho'}`}</span>
        </label>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`${chip} ${reminder.type === 'vacuna' ? 'bg-[#d9e2ff] text-[#2a3f9e]' : 'bg-[#ecdcf5] text-[#6a2585]'}`}>
              {REMINDER_LABEL[reminder.type]}
            </span>
            <span className={`font-extrabold break-words ${reminder.done ? 'text-muted line-through' : ''}`}>
              {reminder.name}
            </span>
          </div>
          {showPatient && <div className="mt-1"><PatientLink patientId={reminder.patientId} /></div>}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-muted">
            {formatDate(reminder.dueDate)}
            <span className={`${chip} ${status.className}`}>{status.label}</span>
          </div>
        </div>
      </div>

      {mode === 'confirmDelete' ? (
        <div className="ml-auto flex flex-wrap items-center gap-2" role="group" aria-label="Confirmar eliminación">
          <span className="text-sm font-extrabold text-brand-dark">¿Eliminar?</span>
          <button type="button" onClick={remove} className={`${btnDanger} min-h-10 px-4`}>Sí, eliminar</button>
          <button type="button" onClick={() => setMode('view')} className={`${btnGhost} min-h-10 px-4`}>No</button>
        </div>
      ) : (
        <div className="ml-auto flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setMode('edit')}
            aria-label={`Editar recordatorio ${reminder.name}`}
            title="Editar recordatorio"
            className={iconBtn}
          >
            <EditIcon />
          </button>
          <button
            type="button"
            onClick={() => setMode('confirmDelete')}
            aria-label={`Eliminar recordatorio ${reminder.name}`}
            title="Eliminar recordatorio"
            className={iconBtnDanger}
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </li>
  )
}
