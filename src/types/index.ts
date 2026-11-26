export const SPECIES = ['perro', 'gato', 'ave', 'conejo', 'roedor', 'reptil', 'otro'] as const
export type Species = typeof SPECIES[number]

export const SPECIES_LABEL: Record<Species, string> = {
    perro: 'Perro',
    gato: 'Gato',
    ave: 'Ave',
    conejo: 'Conejo',
    roedor: 'Roedor',
    reptil: 'Reptil',
    otro: 'Otro',
}

export type Consultation = {
    id: string
    date: string
    symptoms: string
    diagnosis: string
    treatment: string
    weight: number | null
}

export type DraftConsultation = Omit<Consultation, 'id'>

export type Patient = {
    id: string
    name: string
    species: Species
    breed: string
    age: number | null
    weight: number | null
    caretaker: string
    email: string
    phone: string
    date: string
    symptoms: string
    consultations: Consultation[]
    /** Fecha en que el paciente sanó y fue dado de alta; null mientras sigue en tratamiento */
    dischargeDate: string | null
}

export type DraftPatient = Omit<Patient, 'id' | 'consultations' | 'dischargeDate'>

export type Appointment = {
    id: string
    patientId: Patient['id']
    date: string
    time: string
    reason: string
}

export type DraftAppointment = Omit<Appointment, 'id'>

export type ReminderType = 'vacuna' | 'desparasitacion'

export const REMINDER_LABEL: Record<ReminderType, string> = {
    vacuna: 'Vacuna',
    desparasitacion: 'Desparasitación',
}

export type Reminder = {
    id: string
    patientId: Patient['id']
    type: ReminderType
    name: string
    dueDate: string
    done: boolean
}

export type DraftReminder = Omit<Reminder, 'id' | 'done'>
