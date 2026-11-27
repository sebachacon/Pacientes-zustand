import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { usePatientStore } from '../store'
import { REMINDER_LABEL, type DraftReminder, type ReminderType } from '../types'
import Error from './Error'
import { btnPrimary, inputClass, labelClass } from './ui'

type ReminderFormProps = {
  patientId?: string
}

export default function ReminderForm({ patientId }: ReminderFormProps) {

  const patients = usePatientStore(state => state.patients)
  const addReminder = usePatientStore(state => state.addReminder)
  const uid = useId()

  const initial: DraftReminder = {
    patientId: patientId ?? '',
    type: 'vacuna',
    name: '',
    dueDate: '',
  }

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DraftReminder>({
    defaultValues: initial
  })

  const onSubmit = async (data: DraftReminder) => {
    if (!await addReminder({ ...data, patientId: patientId ?? data.patientId })) return
    toast.success('Recordatorio creado')
    reset(initial)
  }

  if (!patientId && patients.length === 0) {
    return <p className="text-muted-dark">Registra un paciente para poder crearle recordatorios.</p>
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
      {!patientId && (
        <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
          <label htmlFor={`${uid}-patient`} className={labelClass}>Paciente</label>
          <select
            id={`${uid}-patient`}
            className={`${inputClass(!!errors.patientId)} cursor-pointer`}
            {...register('patientId', { required: 'Elige un paciente' })}
          >
            <option value="">Selecciona un paciente</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>{patient.name} · {patient.caretaker}</option>
            ))}
          </select>
          {errors.patientId && <Error>{errors.patientId.message}</Error>}
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-2">
        <label htmlFor={`${uid}-type`} className={labelClass}>Tipo</label>
        <select id={`${uid}-type`} className={`${inputClass()} cursor-pointer`} {...register('type')}>
          {(Object.keys(REMINDER_LABEL) as ReminderType[]).map(type => (
            <option key={type} value={type}>{REMINDER_LABEL[type]}</option>
          ))}
        </select>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <label htmlFor={`${uid}-due`} className={labelClass}>Vence el</label>
        <input
          id={`${uid}-due`}
          type="date"
          className={inputClass(!!errors.dueDate)}
          {...register('dueDate', { required: 'La fecha es obligatoria' })}
        />
        {errors.dueDate && <Error>{errors.dueDate.message}</Error>}
      </div>

      <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
        <label htmlFor={`${uid}-name`} className={labelClass}>Detalle</label>
        <input
          id={`${uid}-name`}
          type="text"
          placeholder="Ej. Antirrábica, Óctuple, Pipeta mensual"
          className={inputClass(!!errors.name)}
          {...register('name', { required: 'Indica qué vacuna o tratamiento es' })}
        />
        {errors.name && <Error>{errors.name.message}</Error>}
      </div>

      <div className="sm:col-span-2">
        <button type="submit" className={btnPrimary}>Crear recordatorio</button>
      </div>
    </form>
  )
}
