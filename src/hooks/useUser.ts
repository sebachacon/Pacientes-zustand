import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { usePatientStore, type StaffMember } from '../store'
import { can, type Permission } from '../utils/permissions'

/** Usuario de Supabase Auth con sesión iniciada (email, fechas de la cuenta). */
export function useUser() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return user
}

/** Nombre para mostrar: el nombre del perfil o, si no hay, la primera parte del email. */
export const staffName = (member: StaffMember | null) =>
  member?.fullName || member?.email.split('@')[0] || ''

/** Qué tan completo está el perfil (nombre y teléfono; el cargo lo asigna el administrador). */
export const profileCompletion = (member: StaffMember | null) => {
  const fields = [
    { label: 'tu nombre', done: !!member?.fullName.trim() },
    { label: 'tu teléfono', done: !!member?.phone.trim() },
  ]
  const done = fields.filter(field => field.done).length
  return {
    percent: Math.round((done / fields.length) * 100),
    missing: fields.filter(field => !field.done).map(field => field.label),
  }
}

/** ¿El cargo del usuario actual permite esta acción? */
export function useCan(permission: Permission) {
  return usePatientStore(state => can(state.me?.role, permission))
}
