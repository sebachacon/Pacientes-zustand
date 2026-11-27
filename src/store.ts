import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { toast } from 'react-toastify'
import { supabase } from './lib/supabase'
import type { Row } from './types/database'
import type {
    Appointment, Consultation, DraftAppointment, DraftConsultation, DraftPatient,
    DraftReminder, Patient, Reminder
} from './types'

// --- Conversión entre filas de la base (snake_case) y tipos de la app ---

const toConsultation = (row: Row<'consultations'>): Consultation => ({
    id: row.id,
    date: row.date,
    symptoms: row.symptoms,
    diagnosis: row.diagnosis,
    treatment: row.treatment,
    weight: row.weight,
})

type PatientRow = Row<'patients'> & { consultations: Row<'consultations'>[] }

const toPatient = (row: PatientRow): Patient => ({
    id: row.id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    age: row.age,
    weight: row.weight,
    caretaker: row.caretaker,
    email: row.email,
    phone: row.phone,
    date: row.admission_date,
    symptoms: row.symptoms,
    dischargeDate: row.discharge_date,
    consultations: (row.consultations ?? []).map(toConsultation),
})

const fromDraftPatient = (data: DraftPatient) => ({
    name: data.name,
    species: data.species,
    breed: data.breed,
    age: data.age,
    weight: data.weight,
    caretaker: data.caretaker,
    email: data.email,
    phone: data.phone,
    admission_date: data.date,
    symptoms: data.symptoms,
})

// Postgres devuelve la hora como HH:MM:SS; la app trabaja con HH:MM
const toAppointment = (row: Row<'appointments'>): Appointment => ({
    id: row.id,
    patientId: row.patient_id,
    date: row.date,
    time: row.time.slice(0, 5),
    reason: row.reason,
})

const fromDraftAppointment = (data: DraftAppointment) => ({
    patient_id: data.patientId,
    date: data.date,
    time: data.time,
    reason: data.reason,
})

const toReminder = (row: Row<'reminders'>): Reminder => ({
    id: row.id,
    patientId: row.patient_id,
    type: row.type,
    name: row.name,
    dueDate: row.due_date,
    done: row.done,
})

const fromDraftReminder = (data: DraftReminder) => ({
    patient_id: data.patientId,
    type: data.type,
    name: data.name,
    due_date: data.dueDate,
})

// Muestra el error al usuario y devuelve false para que el componente no siga
const fail = (action: string, error: { message: string }) => {
    console.error(action, error)
    toast.error(`No se pudo ${action}: ${error.message}`)
    return false
}

const PATIENT_SELECT = '*, consultations(*)'

type PatientState = {
    patients: Patient[]
    appointments: Appointment[]
    reminders: Reminder[]
    activeId: Patient['id']
    detailId: Patient['id']
    loading: boolean
    loaded: boolean

    loadAll: () => Promise<void>
    reset: () => void

    addPatient: (data: DraftPatient) => Promise<boolean>
    deletePatient: (id: Patient['id']) => Promise<boolean>
    getPatientById: (id: Patient['id']) => void
    clearActive: () => void
    updatePatient: (data: DraftPatient) => Promise<boolean>
    dischargePatient: (id: Patient['id'], date: string) => Promise<boolean>
    reopenPatient: (id: Patient['id']) => Promise<boolean>

    openDetail: (id: Patient['id']) => void
    closeDetail: () => void

    addConsultation: (patientId: Patient['id'], data: DraftConsultation) => Promise<boolean>
    deleteConsultation: (patientId: Patient['id'], consultationId: string) => Promise<boolean>

    addAppointment: (data: DraftAppointment) => Promise<boolean>
    updateAppointment: (id: Appointment['id'], data: DraftAppointment) => Promise<boolean>
    deleteAppointment: (id: Appointment['id']) => Promise<boolean>

    addReminder: (data: DraftReminder) => Promise<boolean>
    updateReminder: (id: Reminder['id'], data: DraftReminder) => Promise<boolean>
    toggleReminder: (id: Reminder['id']) => Promise<boolean>
    deleteReminder: (id: Reminder['id']) => Promise<boolean>
}

const initialData = {
    patients: [] as Patient[],
    appointments: [] as Appointment[],
    reminders: [] as Reminder[],
    activeId: '',
    detailId: '',
    loading: false,
    loaded: false,
}

const replacePatient = (patients: Patient[], updated: Patient) =>
    patients.map(patient => patient.id === updated.id ? updated : patient)

export const usePatientStore = create<PatientState>()(
    devtools((set, get) => ({
    ...initialData,

    loadAll: async () => {
        set({ loading: true })
        const [patients, appointments, reminders] = await Promise.all([
            supabase.from('patients').select(PATIENT_SELECT).order('created_at'),
            supabase.from('appointments').select('*').order('date').order('time'),
            supabase.from('reminders').select('*').order('due_date'),
        ])
        const error = patients.error ?? appointments.error ?? reminders.error
        if (error) {
            set({ loading: false })
            fail('cargar los datos', error)
            return
        }
        set({
            patients: (patients.data ?? []).map(toPatient),
            appointments: (appointments.data ?? []).map(toAppointment),
            reminders: (reminders.data ?? []).map(toReminder),
            loading: false,
            loaded: true,
        })
    },

    reset: () => set({ ...initialData }),

    addPatient: async (data) => {
        const { data: row, error } = await supabase
            .from('patients').insert(fromDraftPatient(data)).select(PATIENT_SELECT).single()
        if (error) return fail('registrar el paciente', error)
        set((state) => ({ patients: [...state.patients, toPatient(row)] }))
        return true
    },
    deletePatient: async (id) => {
        // Las consultas, citas y recordatorios se borran en cascada en la base
        const { error } = await supabase.from('patients').delete().eq('id', id)
        if (error) return fail('eliminar el paciente', error)
        set((state) => ({
            patients: state.patients.filter(patient => patient.id !== id),
            appointments: state.appointments.filter(appointment => appointment.patientId !== id),
            reminders: state.reminders.filter(reminder => reminder.patientId !== id),
            activeId: state.activeId === id ? '' : state.activeId,
            detailId: state.detailId === id ? '' : state.detailId,
        }))
        return true
    },
    getPatientById: (id) => set({ activeId: id }),
    clearActive: () => set({ activeId: '' }),
    updatePatient: async (data) => {
        const id = get().activeId
        if (!id) return false
        const { data: row, error } = await supabase
            .from('patients').update(fromDraftPatient(data)).eq('id', id).select(PATIENT_SELECT).single()
        if (error) return fail('actualizar el paciente', error)
        set((state) => ({ patients: replacePatient(state.patients, toPatient(row)), activeId: '' }))
        return true
    },

    dischargePatient: async (id, date) => {
        const { data: row, error } = await supabase
            .from('patients').update({ discharge_date: date }).eq('id', id).select(PATIENT_SELECT).single()
        if (error) return fail('dar de alta al paciente', error)
        set((state) => ({ patients: replacePatient(state.patients, toPatient(row)) }))
        return true
    },
    reopenPatient: async (id) => {
        const { data: row, error } = await supabase
            .from('patients').update({ discharge_date: null }).eq('id', id).select(PATIENT_SELECT).single()
        if (error) return fail('reabrir el caso', error)
        set((state) => ({ patients: replacePatient(state.patients, toPatient(row)) }))
        return true
    },

    openDetail: (id) => set({ detailId: id }),
    closeDetail: () => set({ detailId: '' }),

    addConsultation: async (patientId, data) => {
        const { data: row, error } = await supabase.from('consultations').insert({
            patient_id: patientId,
            date: data.date,
            symptoms: data.symptoms,
            diagnosis: data.diagnosis,
            treatment: data.treatment,
            weight: data.weight,
        }).select().single()
        if (error) return fail('registrar la consulta', error)

        // El peso de la consulta pasa a ser el peso actual del paciente
        if (data.weight !== null && data.weight !== undefined) {
            const { error: weightError } = await supabase
                .from('patients').update({ weight: data.weight }).eq('id', patientId)
            if (weightError) fail('actualizar el peso del paciente', weightError)
        }

        set((state) => ({
            patients: state.patients.map(patient => patient.id === patientId
                ? {
                    ...patient,
                    weight: data.weight ?? patient.weight,
                    consultations: [...patient.consultations, toConsultation(row)],
                }
                : patient)
        }))
        return true
    },
    deleteConsultation: async (patientId, consultationId) => {
        const { error } = await supabase.from('consultations').delete().eq('id', consultationId)
        if (error) return fail('eliminar la consulta', error)
        set((state) => ({
            patients: state.patients.map(patient => patient.id === patientId
                ? { ...patient, consultations: patient.consultations.filter(c => c.id !== consultationId) }
                : patient)
        }))
        return true
    },

    addAppointment: async (data) => {
        const { data: row, error } = await supabase
            .from('appointments').insert(fromDraftAppointment(data)).select().single()
        if (error) return fail('agendar la cita', error)
        set((state) => ({ appointments: [...state.appointments, toAppointment(row)] }))
        return true
    },
    updateAppointment: async (id, data) => {
        const { data: row, error } = await supabase
            .from('appointments').update(fromDraftAppointment(data)).eq('id', id).select().single()
        if (error) return fail('actualizar la cita', error)
        set((state) => ({
            appointments: state.appointments.map(appointment => appointment.id === id ? toAppointment(row) : appointment)
        }))
        return true
    },
    deleteAppointment: async (id) => {
        const { error } = await supabase.from('appointments').delete().eq('id', id)
        if (error) return fail('eliminar la cita', error)
        set((state) => ({ appointments: state.appointments.filter(appointment => appointment.id !== id) }))
        return true
    },

    addReminder: async (data) => {
        const { data: row, error } = await supabase
            .from('reminders').insert(fromDraftReminder(data)).select().single()
        if (error) return fail('crear el recordatorio', error)
        set((state) => ({ reminders: [...state.reminders, toReminder(row)] }))
        return true
    },
    updateReminder: async (id, data) => {
        const { data: row, error } = await supabase
            .from('reminders').update(fromDraftReminder(data)).eq('id', id).select().single()
        if (error) return fail('actualizar el recordatorio', error)
        set((state) => ({ reminders: state.reminders.map(reminder => reminder.id === id ? toReminder(row) : reminder) }))
        return true
    },
    toggleReminder: async (id) => {
        const current = get().reminders.find(reminder => reminder.id === id)
        if (!current) return false
        const { data: row, error } = await supabase
            .from('reminders').update({ done: !current.done }).eq('id', id).select().single()
        if (error) return fail('actualizar el recordatorio', error)
        set((state) => ({ reminders: state.reminders.map(reminder => reminder.id === id ? toReminder(row) : reminder) }))
        return true
    },
    deleteReminder: async (id) => {
        const { error } = await supabase.from('reminders').delete().eq('id', id)
        if (error) return fail('eliminar el recordatorio', error)
        set((state) => ({ reminders: state.reminders.filter(reminder => reminder.id !== id) }))
        return true
    },
 }))
)
