import { supabase } from '../lib/supabase'
import { SPECIES, type Appointment, type Patient, type Reminder } from '../types'
import type { Insert } from '../types/database'
import { todayYMD } from './date'

// Clave donde la versión anterior de la app (Zustand persist) guardaba los datos
export const LEGACY_KEY = 'patient-storage'
const IMPORTED_KEY = 'patient-storage-importado'

type LegacyState = {
    patients?: Partial<Patient>[]
    appointments?: Partial<Appointment>[]
    reminders?: Partial<Reminder>[]
}

export type LocalData = {
    patients: Insert<'patients'>[]
    consultations: Insert<'consultations'>[]
    appointments: Insert<'appointments'>[]
    reminders: Insert<'reminders'>[]
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const isUuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value)

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

// Acepta YYYY-MM-DD o cualquier fecha que entienda Date; si no, null
const toDate = (value: unknown): string | null => {
    if (typeof value !== 'string' && typeof value !== 'number') return null
    const raw = String(value)
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
    const parsed = new Date(raw)
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10)
}

const toTime = (value: unknown) => {
    const match = /^(\d{1,2}):(\d{2})/.exec(text(value))
    return match ? `${match[1].padStart(2, '0')}:${match[2]}` : null
}

const positive = (value: unknown) => {
    const n = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(n) && n > 0 ? n : null
}

const nonNegative = (value: unknown) => {
    if (value === null || value === undefined || value === '') return null
    const n = Number(value)
    return Number.isFinite(n) && n >= 0 ? n : null
}

const readLegacy = (): LegacyState | null => {
    try {
        const raw = localStorage.getItem(LEGACY_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as { state?: LegacyState }
        return parsed?.state ?? null
    } catch {
        return null
    }
}

/** Lee y normaliza los datos guardados en este navegador. Devuelve null si no hay nada que importar. */
export const readLocalData = (): LocalData | null => {
    const state = readLegacy()
    if (!state) return null

    const data: LocalData = { patients: [], consultations: [], appointments: [], reminders: [] }
    const patientIds = new Set<string>()

    for (const p of state.patients ?? []) {
        if (!isUuid(p.id) || !text(p.name)) continue
        const admission = toDate(p.date) ?? todayYMD()
        let discharge = toDate(p.dischargeDate)
        if (discharge && discharge < admission) discharge = admission

        patientIds.add(p.id)
        data.patients.push({
            id: p.id,
            name: text(p.name),
            species: SPECIES.includes(p.species as never) ? p.species : 'otro',
            breed: text(p.breed),
            age: nonNegative(p.age),
            weight: positive(p.weight),
            caretaker: text(p.caretaker) || 'Sin dato',
            email: text(p.email),
            phone: text(p.phone),
            admission_date: admission,
            symptoms: text(p.symptoms),
            discharge_date: discharge,
        })

        for (const c of p.consultations ?? []) {
            const date = toDate(c?.date)
            if (!isUuid(c?.id) || !date) continue
            data.consultations.push({
                id: c.id,
                patient_id: p.id,
                date,
                symptoms: text(c.symptoms),
                diagnosis: text(c.diagnosis),
                treatment: text(c.treatment),
                weight: positive(c.weight),
            })
        }
    }

    for (const a of state.appointments ?? []) {
        const date = toDate(a.date)
        const time = toTime(a.time)
        if (!isUuid(a.id) || !a.patientId || !patientIds.has(a.patientId) || !date || !time) continue
        data.appointments.push({
            id: a.id,
            patient_id: a.patientId,
            date,
            time,
            reason: text(a.reason) || 'Sin motivo',
        })
    }

    for (const r of state.reminders ?? []) {
        const due = toDate(r.dueDate)
        if (!isUuid(r.id) || !r.patientId || !patientIds.has(r.patientId) || !due) continue
        data.reminders.push({
            id: r.id,
            patient_id: r.patientId,
            type: r.type === 'desparasitacion' ? 'desparasitacion' : 'vacuna',
            name: text(r.name) || 'Sin nombre',
            due_date: due,
            done: Boolean(r.done),
        })
    }

    return data.patients.length > 0 ? data : null
}

/**
 * Sube los datos a Supabase conservando los IDs originales.
 * Si se ejecuta dos veces, los registros ya importados se omiten.
 */
export const importLocalData = async (data: LocalData) => {
    const steps = [
        () => supabase.from('patients').upsert(data.patients, { onConflict: 'id', ignoreDuplicates: true }),
        () => supabase.from('consultations').upsert(data.consultations, { onConflict: 'id', ignoreDuplicates: true }),
        () => supabase.from('appointments').upsert(data.appointments, { onConflict: 'id', ignoreDuplicates: true }),
        () => supabase.from('reminders').upsert(data.reminders, { onConflict: 'id', ignoreDuplicates: true }),
    ]
    for (const step of steps) {
        const { error } = await step()
        if (error) throw new Error(error.message)
    }
}

/** Deja una copia de respaldo y quita la clave original para no volver a ofrecer la importación. */
export const archiveLocalData = () => {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (raw) localStorage.setItem(IMPORTED_KEY, raw)
    localStorage.removeItem(LEGACY_KEY)
}
