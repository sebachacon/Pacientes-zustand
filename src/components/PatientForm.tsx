import { useForm } from 'react-hook-form'
import Error from './Error'
import { SPECIES, SPECIES_LABEL, type DraftPatient } from '../types'
import { usePatientStore } from '../store'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { CheckIcon } from './Icons'
import { btnDark, btnGhost, btnPrimary, inputClass, labelClass } from './ui'

const steps: { title: string, fields: (keyof DraftPatient)[] }[] = [
    { title: 'Mascota', fields: ['name', 'species', 'breed', 'date', 'age', 'weight'] },
    { title: 'Dueño', fields: ['caretaker', 'email', 'phone'] },
    { title: 'Síntomas', fields: ['symptoms'] },
]

const emptyPatient: DraftPatient = {
    name: '',
    species: 'perro',
    breed: '',
    age: null,
    weight: null,
    caretaker: '',
    email: '',
    phone: '',
    date: '',
    symptoms: '',
}

const toNumberOrNull = (value: unknown) =>
    value === '' || value === null || value === undefined ? null : Number(value)

export default function PatientForm() {

    const addPatient = usePatientStore(state => state.addPatient)
    const activeId = usePatientStore(state => state.activeId)
    const patients = usePatientStore(state => state.patients)
    const updatePatient = usePatientStore(state => state.updatePatient)
    const clearActive = usePatientStore(state => state.clearActive)

    const [step, setStep] = useState(0)
    const [prevActiveId, setPrevActiveId] = useState(activeId)

    // Al elegir un paciente para editar, volver al primer paso
    if (activeId !== prevActiveId) {
        setPrevActiveId(activeId)
        if (activeId) setStep(0)
    }

    const {register, handleSubmit, formState: {errors}, reset, trigger} = useForm<DraftPatient>({
        defaultValues: emptyPatient
    })

    useEffect(() => {
        if(activeId) {
           const activePatient = patients.find(patient => patient.id === activeId)
           if (!activePatient) return
           // eslint-disable-next-line @typescript-eslint/no-unused-vars
           const { id, consultations, dischargeDate, ...draft } = activePatient
           reset({ ...emptyPatient, ...draft })
        }
    // Solo se cargan los datos al cambiar de paciente activo
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId])

    const registerPatient = async (data: DraftPatient) => {
        if(activeId) {
            if (!await updatePatient(data)) return
            toast.success('Paciente Actualizado Correctamente')
        } else {
            if (!await addPatient(data)) return
            toast.success('Paciente Registrado Correctamente')
        }
        reset(emptyPatient)
        setStep(0)
    }

    const cancelEdit = () => {
        clearActive()
        reset(emptyPatient)
        setStep(0)
    }

    const isLastStep = step === steps.length - 1

    const goNext = async () => {
        const valid = await trigger(steps[step].fields)
        if (valid) setStep(current => Math.min(current + 1, steps.length - 1))
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (!isLastStep) {
            e.preventDefault()
            goNext()
            return
        }
        handleSubmit(registerPatient)(e)
    }

  return (
    <section id="registro" className="flex scroll-mt-6 flex-wrap gap-8 rounded-[28px] bg-white p-6 sm:p-8">
        <div className="max-w-xs flex-[1_1_260px]">
            <h2 className="text-2xl font-black sm:text-[26px]">
                {activeId ? 'Editar paciente' : 'Registrar paciente'}
            </h2>
            <p className="mt-2 mb-6 text-[15px] text-muted-dark">
                Añade pacientes y <span className="font-bold text-brand-dark">adminístralos</span> en tres pasos rápidos.
            </p>

            <ol className="flex flex-col gap-3.5">
                {steps.map((item, index) => {
                    const isDone = index < step
                    const isCurrent = index === step
                    return (
                        <li
                            key={item.title}
                            aria-current={isCurrent ? 'step' : undefined}
                            className={`flex items-center gap-3 ${isCurrent ? 'font-extrabold text-ink' : 'font-bold text-muted'}`}
                        >
                            <span
                                className={`flex size-8 items-center justify-center rounded-full ${
                                    isCurrent ? 'bg-brand text-white'
                                    : isDone ? 'bg-ink text-white'
                                    : 'border-2 border-line'
                                }`}
                            >
                                {isDone ? <CheckIcon /> : index + 1}
                            </span>
                            {item.title}
                        </li>
                    )
                })}
            </ol>

            {activeId && (
                <button type="button" onClick={cancelEdit} className={`${btnGhost} mt-6`}>
                    Cancelar edición
                </button>
            )}
        </div>

        <form
            className="flex min-w-0 flex-[999_1_520px] flex-col gap-5"
            noValidate
            onSubmit={onSubmit}
        >
            <div className={step === 0 ? 'grid gap-5 sm:grid-cols-2' : 'hidden'}>
                <div className="flex min-w-0 flex-col gap-2">
                    <label htmlFor="name" className={labelClass}>¿Cómo se llama el paciente?</label>
                    <input
                        id="name"
                        className={inputClass(!!errors.name)}
                        type="text"
                        placeholder="Nombre del Paciente"
                        aria-invalid={!!errors.name}
                        {...register('name', {
                          required: 'El Nombre del paciente es obligatorio'
                        })}
                    />
                    {errors.name && <Error>{errors.name?.message}</Error>}
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                    <label htmlFor="species" className={labelClass}>Especie</label>
                    <select
                        id="species"
                        className={`${inputClass(!!errors.species)} cursor-pointer`}
                        {...register('species', { required: 'La especie es obligatoria' })}
                    >
                        {SPECIES.map(species => (
                            <option key={species} value={species}>{SPECIES_LABEL[species]}</option>
                        ))}
                    </select>
                    {errors.species && <Error>{errors.species?.message}</Error>}
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                    <label htmlFor="breed" className={labelClass}>Raza <span className="font-semibold text-muted">(opcional)</span></label>
                    <input
                        id="breed"
                        className={inputClass()}
                        type="text"
                        placeholder="Ej. Labrador, Siamés, Mestizo"
                        {...register('breed')}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                    <label htmlFor="date" className={labelClass}>Fecha de ingreso</label>
                    <input
                        id="date"
                        className={inputClass(!!errors.date)}
                        type="date"
                        aria-invalid={!!errors.date}
                        {...register('date', {
                            required: 'La fecha de ingreso es obligatoria'
                        })}
                    />
                    {errors.date && <Error>{errors.date?.message}</Error>}
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                    <label htmlFor="age" className={labelClass}>Edad en años <span className="font-semibold text-muted">(opcional)</span></label>
                    <input
                        id="age"
                        className={inputClass(!!errors.age)}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={50}
                        step={0.5}
                        placeholder="Ej. 3"
                        aria-invalid={!!errors.age}
                        {...register('age', {
                            setValueAs: toNumberOrNull,
                            validate: value => value === null || (value >= 0 && value <= 50) || 'Edad no válida'
                        })}
                    />
                    {errors.age && <Error>{errors.age?.message}</Error>}
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                    <label htmlFor="weight" className={labelClass}>Peso en kg <span className="font-semibold text-muted">(opcional)</span></label>
                    <input
                        id="weight"
                        className={inputClass(!!errors.weight)}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={0.1}
                        placeholder="Ej. 12.5"
                        aria-invalid={!!errors.weight}
                        {...register('weight', {
                            setValueAs: toNumberOrNull,
                            validate: value => value === null || (value > 0 && value <= 500) || 'Peso no válido'
                        })}
                    />
                    {errors.weight && <Error>{errors.weight?.message}</Error>}
                </div>
            </div>

            <div className={step === 1 ? 'grid gap-5 sm:grid-cols-2' : 'hidden'}>
                <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
                    <label htmlFor="caretaker" className={labelClass}>Nombre del dueño</label>
                    <input
                        id="caretaker"
                        className={inputClass(!!errors.caretaker)}
                        type="text"
                        placeholder="Nombre del Propietario"
                        aria-invalid={!!errors.caretaker}
                        {...register('caretaker', {
                            required: 'El Propietario es obligatorio'
                        })}
                    />
                    {errors.caretaker && <Error>{errors.caretaker?.message}</Error>}
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                    <label htmlFor="email" className={labelClass}>Email</label>
                    <input
                        id="email"
                        className={inputClass(!!errors.email)}
                        type="email"
                        placeholder="Email de Registro"
                        aria-invalid={!!errors.email}
                        {...register("email", {
                            required: "El Email es Obligatorio",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Email No Válido'
                            }
                        })}
                    />
                    {errors.email && <Error>{errors.email?.message}</Error>}
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                    <label htmlFor="phone" className={labelClass}>Teléfono <span className="font-semibold text-muted">(opcional)</span></label>
                    <input
                        id="phone"
                        className={inputClass(!!errors.phone)}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="Ej. +56 9 1234 5678"
                        aria-invalid={!!errors.phone}
                        {...register('phone', {
                            pattern: {
                                value: /^\+?[\d\s()-]{7,20}$/,
                                message: 'Teléfono no válido'
                            }
                        })}
                    />
                    {errors.phone && <Error>{errors.phone?.message}</Error>}
                </div>
            </div>

            <div className={step === 2 ? 'flex flex-col gap-2' : 'hidden'}>
                <label htmlFor="symptoms" className={labelClass}>Síntomas</label>
                <textarea
                    id="symptoms"
                    rows={4}
                    className={`${inputClass(!!errors.symptoms)} resize-y`}
                    placeholder="Síntomas del paciente"
                    aria-invalid={!!errors.symptoms}
                    {...register('symptoms', {
                        required: 'Los sintomas son obligatorios'
                    })}
                />
                {errors.symptoms && <Error>{errors.symptoms?.message}</Error>}
            </div>

            <div className="mt-1.5 flex flex-wrap justify-between gap-3">
                <button
                    type="button"
                    onClick={() => setStep(current => Math.max(current - 1, 0))}
                    disabled={step === 0}
                    className={`${btnGhost} min-h-[50px] px-6`}
                >
                    Atrás
                </button>

                {isLastStep ? (
                    <button key="submit" type="submit" className={`${btnPrimary} min-h-[50px] px-8`}>
                        {activeId ? 'Guardar Cambios' : 'Guardar Paciente'}
                    </button>
                ) : (
                    <button key="next" type="button" onClick={goNext} className={`${btnDark} min-h-[50px] px-8`}>
                        Siguiente: {steps[step + 1].title}
                    </button>
                )}
            </div>
        </form>
    </section>
  )
}
