import { useForm } from 'react-hook-form'
import Error from './Error'
import type { DraftPatient } from '../types'
import { usePatientStore } from '../store'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { CheckIcon } from './Icons'

const steps: { title: string, fields: (keyof DraftPatient)[] }[] = [
    { title: 'Mascota', fields: ['name', 'date'] },
    { title: 'Dueño', fields: ['caretaker', 'email'] },
    { title: 'Síntomas', fields: ['symptoms'] },
]

const inputClass = (hasError: boolean) =>
    `w-full min-w-0 rounded-2xl border-2 bg-white px-[18px] py-3.5 text-[17px] outline-none transition-colors placeholder:text-muted focus:border-brand ${
        hasError ? 'border-brand-dark bg-danger-soft' : 'border-line'
    }`

const labelClass = 'text-[15px] font-extrabold'

export default function PatientForm() {

    const addPatient = usePatientStore(state => state.addPatient)
    const activeId = usePatientStore(state => state.activeId)
    const patients = usePatientStore(state => state.patients)
    const updatePatient = usePatientStore(state => state.updatePatient)

    const [step, setStep] = useState(0)
    const [prevActiveId, setPrevActiveId] = useState(activeId)

    // Al elegir un paciente para editar, volver al primer paso
    if (activeId !== prevActiveId) {
        setPrevActiveId(activeId)
        if (activeId) setStep(0)
    }

    const {register, handleSubmit, setValue, formState: {errors}, reset, trigger} = useForm<DraftPatient>()

    useEffect(() => {
        if(activeId) {
           const activePatient = patients.filter(patient => patient.id === activeId)[0]
           setValue('name', activePatient.name)
           setValue('caretaker', activePatient.caretaker)
           setValue('date', activePatient.date)
           setValue('email', activePatient.email)
           setValue('symptoms', activePatient.symptoms)
        }
    }, [activeId])

    const registerPatient = (data: DraftPatient) => {
        if(activeId) {
            updatePatient(data)
            toast.success('Paciente Actualizado Correctamente')
        } else {
        addPatient(data)
        toast.success('Paciente Registrado Correctamente')
        }
        reset()
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
                    <label htmlFor="date" className={labelClass}>Fecha de alta</label>
                    <input
                        id="date"
                        className={inputClass(!!errors.date)}
                        type="date"
                        aria-invalid={!!errors.date}
                        {...register('date', {
                            required: 'La fecha de alta es obligatoria'
                        })}
                    />
                    {errors.date && <Error>{errors.date?.message}</Error>}
                </div>
            </div>

            <div className={step === 1 ? 'grid gap-5 sm:grid-cols-2' : 'hidden'}>
                <div className="flex min-w-0 flex-col gap-2">
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
                    className="min-h-[50px] cursor-pointer rounded-full border-2 border-line bg-white px-6 font-extrabold text-muted transition-colors hover:border-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Atrás
                </button>

                {isLastStep ? (
                    <button
                        key="submit"
                        type="submit"
                        className="min-h-[50px] cursor-pointer rounded-full bg-brand px-8 font-extrabold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        Guardar Paciente
                    </button>
                ) : (
                    <button
                        key="next"
                        type="button"
                        onClick={goNext}
                        className="min-h-[50px] cursor-pointer rounded-full bg-ink px-8 font-extrabold text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        Siguiente: {steps[step + 1].title}
                    </button>
                )}
            </div>
        </form>
    </section>
  )
}
