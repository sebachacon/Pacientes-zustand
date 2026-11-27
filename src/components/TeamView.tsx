import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { usePatientStore, type StaffMember } from '../store'
import { ROLES, roleLabel, type Role } from '../utils/permissions'
import { staffName } from '../hooks/useUser'
import ConfirmDialog from './ConfirmDialog'
import { TrashIcon } from './Icons'
import { card, chip, iconBtnDanger, inputClass } from './ui'

const PERMISSION_SUMMARY: Record<Role, string> = {
  administrador: 'Acceso total y gestión del equipo.',
  veterinario: 'Pacientes, ficha clínica, altas y eliminación de registros.',
  tecnico: 'Pacientes, ficha clínica y altas. No elimina pacientes ni consultas.',
  secretario: 'Registro y eliminación de pacientes, citas y recordatorios. Sin acceso a la ficha clínica.',
}

export default function TeamView() {
  const staff = usePatientStore(state => state.staff)
  const me = usePatientStore(state => state.me)
  const loadStaff = usePatientStore(state => state.loadStaff)

  useEffect(() => { loadStaff() }, [loadStaff])

  const pending = staff.filter(member => !member.role)
  const active = staff.filter(member => member.role)

  return (
    <div className="flex flex-col gap-6">
      <section className={`${card} flex flex-col gap-3`}>
        <h2 className="text-xl font-black">Qué puede hacer cada cargo</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(ROLES) as Role[]).map(role => (
            <div key={role} className="rounded-2xl bg-cream p-4">
              <dt className="font-extrabold">{ROLES[role]}</dt>
              <dd className="text-muted-dark">{PERMISSION_SUMMARY[role]}</dd>
            </div>
          ))}
        </dl>
      </section>

      {pending.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-black">Pendientes de aprobación <span className={`${chip} ml-1 bg-brand text-white`}>{pending.length}</span></h2>
          <p className="text-muted-dark">Estas cuentas no ven ningún dato hasta que les asignes un cargo.</p>
          <ul className="flex flex-col gap-3">
            {pending.map(member => <MemberRow key={member.userId} member={member} isMe={member.userId === me?.userId} />)}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-black">Equipo</h2>
        <ul className="flex flex-col gap-3">
          {active.map(member => <MemberRow key={member.userId} member={member} isMe={member.userId === me?.userId} />)}
        </ul>
      </section>
    </div>
  )
}

function MemberRow({ member, isMe }: { member: StaffMember, isMe: boolean }) {
  const setStaffRole = usePatientStore(state => state.setStaffRole)
  const deleteStaffAccount = usePatientStore(state => state.deleteStaffAccount)
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const name = staffName(member)
  const selectId = `role-${member.userId}`

  const changeRole = async (role: Role) => {
    setSaving(true)
    const ok = await setStaffRole(member.userId, role)
    setSaving(false)
    if (ok) toast.success(`${name} ahora es ${roleLabel(role)}`)
  }

  const removeAccount = async () => {
    setConfirmOpen(false)
    setSaving(true)
    const ok = await deleteStaffAccount(member.userId)
    setSaving(false)
    if (ok) toast('Cuenta eliminada', { type: 'error' })
  }

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_0_var(--color-line)]">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand font-black text-white" aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-[1_1_12rem]">
        <p className="truncate font-black">
          {name} {isMe && <span className="font-semibold text-muted">(tú)</span>}
        </p>
        <p className="truncate text-muted-dark">{member.email}{member.phone && ` · ${member.phone}`}</p>
      </div>
      <div className="w-full sm:w-56">
        <label htmlFor={selectId} className="sr-only">Cargo de {name}</label>
        <select
          id={selectId}
          value={member.role ?? ''}
          disabled={saving}
          onChange={event => changeRole(event.target.value as Role)}
          className={`${inputClass()} cursor-pointer disabled:opacity-60`}
        >
          {!member.role && <option value="" disabled>Asignar cargo…</option>}
          {(Object.keys(ROLES) as Role[]).map(role => (
            <option key={role} value={role}>{ROLES[role]}</option>
          ))}
        </select>
      </div>
      {/* Tu propia cuenta no se puede eliminar; se reserva el espacio para alinear las filas */}
      {isMe && <span className="hidden size-11 shrink-0 sm:block" aria-hidden="true" />}
      {!isMe && (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={saving}
          aria-label={`Eliminar la cuenta de ${name}`}
          title="Eliminar cuenta"
          className={`${iconBtnDanger} disabled:opacity-60`}
        >
          <TrashIcon />
        </button>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title={`¿Eliminar la cuenta de ${name}?`}
        message={<>{member.email} ya no podrá iniciar sesión. Los pacientes, consultas y citas que registró se conservan. Esta acción no se puede deshacer.</>}
        confirmLabel="Sí, eliminar cuenta"
        onConfirm={removeAccount}
        onCancel={() => setConfirmOpen(false)}
      />
    </li>
  )
}
