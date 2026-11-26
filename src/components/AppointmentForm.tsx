import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { usePatientStore } from '../store'
import type { DraftAppointment } from '../types'
import { todayYMD } from '../utils/date'
import Error from './Error'
import { btnPrimary, inputClass, labelClass } from './ui'

type AppointmentFormProps = {
  patientId?: string
  defaultDate?: string
}

export default function AppointmentForm({ patientId, defaultDate }: AppointmentFormProps) {

  const patients = usePatientStore(state => state.patients)
  const addAppointment = usePatientStore(state => state.addAppointment)
  const uid = useId()

  const initial: DraftAppointment = {
    patientId: patientId ?? '',
    date: defaultDate ?? todayYMD(),
    time: '10:00',
    reason: '',
  }

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DraftAppointment>({
    defaultValues: initial
  })

  useEffect(() => {
    if (defaultDate) setValue('date', defaultDate)
  }, [defaultDate, setValue])

  const onSubmit = (data: DraftAppointment) => {
    addAppointment({ ...data, patientId: patientId ?? data.patientId })
    toast.success('Cita agendada')
    reset({ ...initial, date: data.date })
  }

  if (!patientId && patients.length === 0) {
    return <p className="text-muted-dark">Registra un paciente para poder agendarle citas.</p>
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
        <label htmlFor={`${uid}-date`} className={labelClass}>Fecha</label>
        <input
          id={`${uid}-date`}
          type="date"
          className={inputClass(!!errors.date)}
          {...register('date', { required: 'La fecha es obligatoria' })}
        />
        {errors.date && <Error>{errors.date.message}</Error>}
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <label htmlFor={`${uid}-time`} className={labelClass}>Hora</label>
        <input
          id={`${uid}-time`}
          type="time"
          className={inputClass(!!errors.time)}
          {...register('time', { required: 'La hora es obligatoria' })}
        />
        {errors.time && <Error>{errors.time.message}</Error>}
      </div>

      <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
        <label htmlFor={`${uid}-reason`} className={labelClass}>Motivo</label>
        <input
          id={`${uid}-reason`}
          type="text"
          placeholder="Ej. Control post operatorio"
          className={inputClass(!!errors.reason)}
          {...register('reason', { required: 'El motivo es obligatorio' })}
        />
        {errors.reason && <Error>{errors.reason.message}</Error>}
      </div>

      <div className="sm:col-span-2">
        <button type="submit" className={btnPrimary}>Agendar cita</button>
      </div>
    </form>
  )
}
