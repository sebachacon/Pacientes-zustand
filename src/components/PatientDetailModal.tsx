import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { usePatientStore } from '../store'
import { SPECIES_LABEL, type Consultation, type DraftConsultation, type Patient } from '../types'
import { formatDate, parseYMD, todayYMD } from '../utils/date'
import { formatAge, formatWeight, initialOf, tintFor } from '../utils/patient'
import { telUrl, whatsappUrl } from '../utils/contact'
import Modal from './Modal'
import Error from './Error'
import AppointmentForm from './AppointmentForm'
import ReminderForm from './ReminderForm'
import { AppointmentItem, ReminderItem } from './ScheduleItems'
import { ChatIcon, CloseIcon, CopyIcon, EditIcon, MailIcon, PhoneIcon, TrashIcon } from './Icons'
import { btnGhost, btnPrimary, chip, iconBtn, iconBtnDanger, inputClass, labelClass } from './ui'

type Tab = 'historial' | 'citas' | 'recordatorios'

const tabs: { id: Tab, label: string }[] = [
  { id: 'historial', label: 'Historial' },
  { id: 'citas', label: 'Citas' },
  { id: 'recordatorios', label: 'Recordatorios' },
]

type PatientDetailModalProps = {
  onEdit: (id: Patient['id']) => void
}

export default function PatientDetailModal({ onEdit }: PatientDetailModalProps) {

  const detailId = usePatientStore(state => state.detailId)
  const patient = usePatientStore(state => state.patients.find(p => p.id === state.detailId))
  const closeDetail = usePatientStore(state => state.closeDetail)
  const titleId = useId()

  return (
    <Modal open={!!detailId && !!patient} onClose={closeDetail} labelledBy={titleId} size="lg">
      {patient && <PatientFile key={patient.id} patient={patient} titleId={titleId} onEdit={onEdit} onClose={closeDetail} />}
    </Modal>
  )
}

function PatientFile({ patient, titleId, onEdit, onClose }: {
  patient: Patient
  titleId: string
  onEdit: (id: Patient['id']) => void
  onClose: () => void
}) {

  const allAppointments = usePatientStore(state => state.appointments)
  const allReminders = usePatientStore(state => state.reminders)
  const [tab, setTab] = useState<Tab>('historial')

  const tint = tintFor(patient.id)
  const appointments = allAppointments
    .filter(a => a.patientId === patient.id)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const reminders = allReminders
    .filter(r => r.patientId === patient.id)
    .sort((a, b) => Number(a.done) - Number(b.done) || a.dueDate.localeCompare(b.dueDate))

  const counts: Record<Tab, number> = {
    historial: patient.consultations.length,
    citas: appointments.length,
    recordatorios: reminders.filter(r => !r.done).length,
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(patient.id)
      toast.info('ID copiado')
    } catch {
      toast.error('No se pudo copiar el ID')
    }
  }

  const facts = [
    { label: 'Especie', value: SPECIES_LABEL[patient.species] },
    { label: 'Raza', value: patient.breed || '—' },
    { label: 'Edad', value: formatAge(patient.age) || '—' },
    { label: 'Peso', value: formatWeight(patient.weight) || '—' },
    { label: 'Ingreso', value: formatDate(patient.date) },
  ]

  const stayDays = patient.dischargeDate
    ? Math.max(0, Math.round((parseYMD(patient.dischargeDate).getTime() - parseYMD(patient.date).getTime()) / 86_400_000))
    : null

  return (
    <div className="flex flex-col">
      <header className={`relative px-6 pt-6 pb-14 sm:px-8 ${tint.bg}`}>
        <button type="button" onClick={onClose} aria-label="Cerrar ficha" className={`${iconBtn} absolute top-4 right-4 border-transparent`}>
          <CloseIcon />
        </button>
        <p className="text-sm font-extrabold tracking-wide text-ink/70 uppercase">Ficha del paciente</p>
      </header>

      <div className="relative -mt-12 flex flex-col gap-6 px-6 pb-8 sm:px-8">
        <div className="flex flex-wrap items-end gap-4">
          <div
            className={`flex size-24 items-center justify-center rounded-[40%_60%_55%_45%/50%_45%_55%_50%] border-4 border-cream bg-white text-[42px] font-black shadow-[0_4px_12px_rgba(43,29,24,.12)] ${tint.ink}`}
            aria-hidden="true"
          >
            {initialOf(patient)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id={titleId} className="text-3xl font-black break-words">{patient.name}</h2>
              <span className={`${chip} ${patient.dischargeDate ? 'bg-[#d4ecdc] text-[#1d5c40]' : 'bg-[#ffe8b3] text-[#6b4500]'}`}>
                {patient.dischargeDate ? 'De alta' : 'En tratamiento'}
              </span>
            </div>
            <button
              type="button"
              onClick={copyId}
              className="mt-1 inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-full font-mono text-xs text-muted hover:text-ink"
              title="Copiar ID"
            >
              <span className="truncate">ID {patient.id}</span>
              <CopyIcon className="size-3.5 shrink-0" />
            </button>
          </div>
          <button type="button" onClick={() => onEdit(patient.id)} className={btnGhost}>
            <EditIcon /> Editar datos
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {facts.map(fact => (
            <div key={fact.label} className="rounded-2xl bg-white px-4 py-3">
              <dt className="text-xs font-extrabold tracking-wide text-muted uppercase">{fact.label}</dt>
              <dd className="mt-0.5 font-extrabold break-words">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-5">
            <h3 className="text-xs font-extrabold tracking-wide text-muted uppercase">Dueño</h3>
            <p className="mt-1 text-lg font-extrabold">{patient.caretaker}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`mailto:${patient.email}`} className={`${chip} bg-cream py-2 text-ink hover:bg-line`}>
                <MailIcon className="size-4" /> {patient.email}
              </a>
              {patient.phone && (
                <>
                  <a href={telUrl(patient.phone)} className={`${chip} bg-cream py-2 text-ink hover:bg-line`}>
                    <PhoneIcon className="size-4" /> {patient.phone}
                  </a>
                  <a href={whatsappUrl(patient.phone)} target="_blank" rel="noreferrer" className={`${chip} bg-[#d4ecdc] py-2 text-[#1d5c40] hover:bg-[#bfe2cb]`}>
                    <ChatIcon className="size-4" /> WhatsApp
                  </a>
                </>
              )}
            </div>
          </section>
          <section className="rounded-2xl bg-white p-5">
            <h3 className="text-xs font-extrabold tracking-wide text-muted uppercase">Síntomas al ingreso</h3>
            <p className="mt-1 leading-relaxed break-words text-ink-soft">{patient.symptoms}</p>
          </section>
        </div>

        <DischargePanel patient={patient} stayDays={stayDays} />

        <div>
          <div role="tablist" aria-label="Secciones de la ficha" className="flex flex-wrap gap-2">
            {tabs.map(item => (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                aria-controls={`panel-${item.id}`}
                onClick={() => setTab(item.id)}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-5 font-extrabold transition-colors ${
                  tab === item.id ? 'bg-ink text-white' : 'bg-white text-muted-dark hover:text-ink'
                }`}
              >
                {item.label}
                <span className={`rounded-full px-2 text-xs ${tab === item.id ? 'bg-white/20' : 'bg-cream'}`}>{counts[item.id]}</span>
              </button>
            ))}
          </div>

          <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-5">
            {tab === 'historial' && <History patient={patient} />}

            {tab === 'citas' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-lg font-black">Citas</h3>
                  {appointments.length === 0
                    ? <p className="rounded-2xl bg-white p-5 text-muted-dark">Sin citas agendadas.</p>
                    : <ul className="flex flex-col gap-3">{appointments.map(a => <AppointmentItem key={a.id} appointment={a} showPatient={false} />)}</ul>}
                </div>
                <div className="rounded-2xl bg-white p-5">
                  <h3 className="mb-4 text-lg font-black">Nueva cita</h3>
                  <AppointmentForm patientId={patient.id} />
                </div>
              </div>
            )}

            {tab === 'recordatorios' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-lg font-black">Vacunas y desparasitación</h3>
                  {reminders.length === 0
                    ? <p className="rounded-2xl bg-white p-5 text-muted-dark">Sin recordatorios.</p>
                    : <ul className="flex flex-col gap-3">{reminders.map(r => <ReminderItem key={r.id} reminder={r} showPatient={false} />)}</ul>}
                </div>
                <div className="rounded-2xl bg-white p-5">
                  <h3 className="mb-4 text-lg font-black">Nuevo recordatorio</h3>
                  <ReminderForm patientId={patient.id} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DischargePanel({ patient, stayDays }: { patient: Patient, stayDays: number | null }) {

  const dischargePatient = usePatientStore(state => state.dischargePatient)
  const reopenPatient = usePatientStore(state => state.reopenPatient)
  const [open, setOpen] = useState(false)
  const uid = useId()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ dischargeDate: string }>({
    defaultValues: { dischargeDate: todayYMD() }
  })

  const onSubmit = async ({ dischargeDate }: { dischargeDate: string }) => {
    if (!await dischargePatient(patient.id, dischargeDate)) return
    toast.success(`${patient.name} fue dado de alta`)
    setOpen(false)
  }

  const reopen = async () => {
    if (!await reopenPatient(patient.id)) return
    reset({ dischargeDate: todayYMD() })
    toast.info('Caso reabierto: el paciente vuelve a tratamiento')
  }

  if (patient.dischargeDate) {
    return (
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#d4ecdc] p-5 text-[#1d5c40]">
        <div>
          <h3 className="text-xs font-extrabold tracking-wide uppercase">Fecha de alta</h3>
          <p className="mt-1 text-lg font-black text-ink">{formatDate(patient.dischargeDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          {stayDays !== null && (
            <p className="font-semibold">Estuvo en tratamiento {stayDays} {stayDays === 1 ? 'día' : 'días'}.</p>
          )}
        </div>
        <button type="button" onClick={reopen} className={btnGhost}>Reabrir caso</button>
      </section>
    )
  }

  return (
    <section className="rounded-2xl bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-extrabold tracking-wide text-muted uppercase">Fecha de alta</h3>
          <p className="mt-1 text-ink-soft">El paciente sigue en tratamiento. Regístrala cuando esté sano.</p>
        </div>
        {!open && (
          <button type="button" onClick={() => setOpen(true)} className={btnPrimary}>Dar de alta</button>
        )}
      </div>
      {open && (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={`${uid}-discharge`} className={labelClass}>Fecha de alta</label>
            <input
              id={`${uid}-discharge`}
              type="date"
              min={patient.date}
              className={inputClass(!!errors.dischargeDate)}
              {...register('dischargeDate', {
                required: 'La fecha de alta es obligatoria',
                validate: value => !patient.date || value >= patient.date || 'No puede ser anterior a la fecha de ingreso'
              })}
            />
          </div>
          <button type="submit" className={btnPrimary}>Confirmar alta</button>
          <button type="button" onClick={() => setOpen(false)} className={btnGhost}>Cancelar</button>
          {errors.dischargeDate && <div className="basis-full"><Error>{errors.dischargeDate.message}</Error></div>}
        </form>
      )}
    </section>
  )
}

const toNumberOrNull = (value: unknown) =>
  value === '' || value === null || value === undefined ? null : Number(value)

function History({ patient }: { patient: Patient }) {

  const addConsultation = usePatientStore(state => state.addConsultation)
  const deleteConsultation = usePatientStore(state => state.deleteConsultation)
  const [showForm, setShowForm] = useState(patient.consultations.length === 0)
  const uid = useId()

  const initial: DraftConsultation = { date: todayYMD(), symptoms: '', diagnosis: '', treatment: '', weight: null }
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DraftConsultation>({ defaultValues: initial })

  const consultations = [...patient.consultations].sort((a, b) => b.date.localeCompare(a.date))
  const weights = [...patient.consultations]
    .filter((c): c is Consultation & { weight: number } => c.weight !== null && c.weight !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))

  const onSubmit = async (data: DraftConsultation) => {
    if (!await addConsultation(patient.id, data)) return
    toast.success('Consulta registrada')
    reset(initial)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-5">
      {weights.length >= 2 && <WeightChart points={weights} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-black">Consultas</h3>
        {!showForm && (
          <button type="button" className={btnPrimary} onClick={() => setShowForm(true)}>Nueva consulta</button>
        )}
      </div>

      {showForm && (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-2xl bg-white p-5 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={`${uid}-date`} className={labelClass}>Fecha</label>
            <input id={`${uid}-date`} type="date" className={inputClass(!!errors.date)} {...register('date', { required: 'La fecha es obligatoria' })} />
            {errors.date && <Error>{errors.date.message}</Error>}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={`${uid}-weight`} className={labelClass}>Peso en kg <span className="font-semibold text-muted">(opcional)</span></label>
            <input
              id={`${uid}-weight`}
              type="number"
              inputMode="decimal"
              step={0.1}
              min={0}
              className={inputClass(!!errors.weight)}
              {...register('weight', {
                setValueAs: toNumberOrNull,
                validate: value => value === null || (value > 0 && value <= 500) || 'Peso no válido'
              })}
            />
            {errors.weight && <Error>{errors.weight.message}</Error>}
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
            <label htmlFor={`${uid}-symptoms`} className={labelClass}>Síntomas / motivo</label>
            <textarea id={`${uid}-symptoms`} rows={2} className={`${inputClass(!!errors.symptoms)} resize-y`} {...register('symptoms', { required: 'Describe el motivo de la consulta' })} />
            {errors.symptoms && <Error>{errors.symptoms.message}</Error>}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={`${uid}-diagnosis`} className={labelClass}>Diagnóstico</label>
            <textarea id={`${uid}-diagnosis`} rows={2} className={`${inputClass()} resize-y`} {...register('diagnosis')} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={`${uid}-treatment`} className={labelClass}>Tratamiento</label>
            <textarea id={`${uid}-treatment`} rows={2} className={`${inputClass()} resize-y`} {...register('treatment')} />
          </div>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" className={btnPrimary}>Guardar consulta</button>
            {patient.consultations.length > 0 && (
              <button type="button" className={btnGhost} onClick={() => { reset(initial); setShowForm(false) }}>Cancelar</button>
            )}
          </div>
        </form>
      )}

      {consultations.length === 0 ? (
        !showForm && <p className="rounded-2xl bg-white p-5 text-muted-dark">Aún no hay consultas registradas.</p>
      ) : (
        <ol className="relative flex flex-col gap-4 border-l-2 border-line pl-6">
          {consultations.map(consultation => (
            <li key={consultation.id} className="relative rounded-2xl bg-white p-5">
              <span className="absolute top-6 -left-[33px] size-4 rounded-full border-4 border-cream bg-brand" aria-hidden="true" />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black">{formatDate(consultation.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  {consultation.weight !== null && consultation.weight !== undefined && (
                    <p className="text-sm font-semibold text-muted">Peso: {formatWeight(consultation.weight)}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => deleteConsultation(patient.id, consultation.id)}
                  aria-label="Eliminar consulta"
                  title="Eliminar consulta"
                  className={iconBtnDanger}
                >
                  <TrashIcon />
                </button>
              </div>
              <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  ['Síntomas', consultation.symptoms],
                  ['Diagnóstico', consultation.diagnosis],
                  ['Tratamiento', consultation.treatment],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-extrabold tracking-wide text-muted uppercase">{label}</dt>
                    <dd className="mt-0.5 break-words text-ink-soft">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function WeightChart({ points }: { points: { date: string, weight: number }[] }) {
  const width = 600
  const height = 120
  const pad = 16
  const values = points.map(p => p.weight)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const coords = points.map((p, i) => ({
    x: pad + (i / (points.length - 1)) * (width - pad * 2),
    y: height - pad - ((p.weight - min) / range) * (height - pad * 2),
    ...p,
  }))
  const last = points[points.length - 1]
  const first = points[0]
  const diff = Math.round((last.weight - first.weight) * 10) / 10

  return (
    <figure className="rounded-2xl bg-white p-5">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-lg font-black">Evolución del peso</span>
        <span className="font-bold text-muted-dark">
          {formatWeight(last.weight)} · {diff === 0 ? 'sin cambios' : `${diff > 0 ? '+' : ''}${diff} kg desde ${formatDate(first.date, { day: 'numeric', month: 'short' })}`}
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-3 h-auto w-full"
        role="img"
        aria-label={`Peso: ${points.map(p => `${formatDate(p.date)} ${p.weight} kg`).join(', ')}`}
      >
        <polyline
          points={coords.map(c => `${c.x},${c.y}`).join(' ')}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {coords.map(c => (
          <circle key={`${c.date}-${c.x}`} cx={c.x} cy={c.y} r={5} fill="white" stroke="var(--color-brand)" strokeWidth={3} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    </figure>
  )
}
