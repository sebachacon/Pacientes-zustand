import type { Database } from '../types/database'

export type Role = Database['public']['Enums']['staff_role']

export const ROLES: Record<Role, string> = {
  administrador: 'Administrador',
  veterinario: 'Médico veterinario',
  tecnico: 'Técnico veterinario',
  secretario: 'Secretario',
}

export const roleLabel = (role: Role | null | undefined) => (role ? ROLES[role] : 'Pendiente de aprobación')

// Debe coincidir con las políticas RLS de la base (migración staff_roles_and_permissions).
// La base es la que hace cumplir los permisos; esto solo adapta la interfaz.
const PERMISSIONS = {
  viewClinicalHistory: ['administrador', 'veterinario', 'tecnico'],
  addConsultation: ['administrador', 'veterinario', 'tecnico'],
  deleteConsultation: ['administrador', 'veterinario'],
  deletePatient: ['administrador', 'veterinario', 'secretario'],
  dischargePatient: ['administrador', 'veterinario', 'tecnico'],
  manageTeam: ['administrador'],
} satisfies Record<string, Role[]>

export type Permission = keyof typeof PERMISSIONS

export const can = (role: Role | null | undefined, permission: Permission) =>
  !!role && (PERMISSIONS[permission] as Role[]).includes(role)
