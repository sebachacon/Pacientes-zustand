import { create } from 'zustand'
import {v4 as uuidv4} from 'uuid'
import { devtools, persist} from 'zustand/middleware'
import type {
    Appointment, DraftAppointment, DraftConsultation, DraftPatient,
    DraftReminder, Patient, Reminder
} from './types'

type PatientState = {
    patients: Patient[]
    appointments: Appointment[]
    reminders: Reminder[]
    activeId: Patient['id']
    detailId: Patient['id']

    addPatient: (data: DraftPatient) => void
    deletePatient: (id: Patient['id']) => void
    getPatientById: (id: Patient['id']) => void
    clearActive: () => void
    updatePatient: (data: DraftPatient) => void
    dischargePatient: (id: Patient['id'], date: string) => void
    reopenPatient: (id: Patient['id']) => void

    openDetail: (id: Patient['id']) => void
    closeDetail: () => void

    addConsultation: (patientId: Patient['id'], data: DraftConsultation) => void
    deleteConsultation: (patientId: Patient['id'], consultationId: string) => void

    addAppointment: (data: DraftAppointment) => void
    updateAppointment: (id: Appointment['id'], data: DraftAppointment) => void
    deleteAppointment: (id: Appointment['id']) => void

    addReminder: (data: DraftReminder) => void
    updateReminder: (id: Reminder['id'], data: DraftReminder) => void
    toggleReminder: (id: Reminder['id']) => void
    deleteReminder: (id: Reminder['id']) => void
}

const createPatient = (patient: DraftPatient) : Patient => {
    return {...patient, id: uuidv4(), consultations: [], dischargeDate: null}
}

type PersistedState = Pick<PatientState, 'patients' | 'appointments' | 'reminders' | 'activeId'>

// Completa los campos nuevos en pacientes guardados con versiones anteriores
const migrate = (persisted: unknown, version: number): PersistedState => {
    const state = (persisted ?? {}) as Partial<PersistedState>
    if (version < 2) {
        return {
            activeId: state.activeId ?? '',
            appointments: state.appointments ?? [],
            reminders: state.reminders ?? [],
            patients: (state.patients ?? []).map(patient => ({
                ...patient,
                date: String(patient.date ?? ''),
                species: patient.species ?? 'otro',
                breed: patient.breed ?? '',
                age: patient.age ?? null,
                weight: patient.weight ?? null,
                phone: patient.phone ?? '',
                consultations: patient.consultations ?? [],
                dischargeDate: patient.dischargeDate ?? null,
            })),
        }
    }
    return state as PersistedState
}

export const usePatientStore = create<PatientState>()(
    devtools(
    persist((set) => ({
    patients: [],
    appointments: [],
    reminders: [],
    activeId: '',
    detailId: '',

    addPatient: (data) => {
        const newPatient = createPatient(data)
        set((state) => ({
             patients: [...state.patients, newPatient]
        }))
    },
    deletePatient: (id) => {
        set((state) => ({
            patients: state.patients.filter( patient => patient.id !== id),
            appointments: state.appointments.filter(appointment => appointment.patientId !== id),
            reminders: state.reminders.filter(reminder => reminder.patientId !== id),
            activeId: state.activeId === id ? '' : state.activeId,
            detailId: state.detailId === id ? '' : state.detailId,
        }))
    },
    getPatientById: (id) => {
        set(() => ({
            activeId: id
        }))
    },
    clearActive: () => {
        set(() => ({ activeId: '' }))
    },
    updatePatient: (data) => {
        set((state) => ({
            patients: state.patients.map(patient => patient.id === state.activeId ? {...patient, ...data, id: state.activeId} : patient),
            activeId: ''
        }))
    },

    dischargePatient: (id, date) => {
        set((state) => ({
            patients: state.patients.map(patient => patient.id === id ? { ...patient, dischargeDate: date } : patient)
        }))
    },
    reopenPatient: (id) => {
        set((state) => ({
            patients: state.patients.map(patient => patient.id === id ? { ...patient, dischargeDate: null } : patient)
        }))
    },

    openDetail: (id) => set(() => ({ detailId: id })),
    closeDetail: () => set(() => ({ detailId: '' })),

    addConsultation: (patientId, data) => {
        set((state) => ({
            patients: state.patients.map(patient => patient.id === patientId
                ? {
                    ...patient,
                    weight: data.weight ?? patient.weight,
                    consultations: [...patient.consultations, { ...data, id: uuidv4() }],
                }
                : patient)
        }))
    },
    deleteConsultation: (patientId, consultationId) => {
        set((state) => ({
            patients: state.patients.map(patient => patient.id === patientId
                ? { ...patient, consultations: patient.consultations.filter(c => c.id !== consultationId) }
                : patient)
        }))
    },

    addAppointment: (data) => {
        set((state) => ({
            appointments: [...state.appointments, { ...data, id: uuidv4() }]
        }))
    },
    updateAppointment: (id, data) => {
        set((state) => ({
            appointments: state.appointments.map(appointment => appointment.id === id ? { ...data, id } : appointment)
        }))
    },
    deleteAppointment: (id) => {
        set((state) => ({
            appointments: state.appointments.filter(appointment => appointment.id !== id)
        }))
    },

    addReminder: (data) => {
        set((state) => ({
            reminders: [...state.reminders, { ...data, id: uuidv4(), done: false }]
        }))
    },
    updateReminder: (id, data) => {
        set((state) => ({
            reminders: state.reminders.map(reminder => reminder.id === id ? { ...reminder, ...data, id } : reminder)
        }))
    },
    toggleReminder: (id) => {
        set((state) => ({
            reminders: state.reminders.map(reminder => reminder.id === id ? { ...reminder, done: !reminder.done } : reminder)
        }))
    },
    deleteReminder: (id) => {
        set((state) => ({
            reminders: state.reminders.filter(reminder => reminder.id !== id)
        }))
    },
 }),{
    name: 'patient-storage',
    version: 2,
    migrate,
    partialize: (state): PersistedState => ({
        patients: state.patients,
        appointments: state.appointments,
        reminders: state.reminders,
        activeId: state.activeId,
    }),
 })
))
