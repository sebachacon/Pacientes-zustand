import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { usePatientStore, type StaffMember } from '../store'
import { roleLabel } from '../utils/permissions'
import { profileCompletion, staffName } from '../hooks/useUser'
import { CompletionBar } from './ProfileReminder'
import Error from './Error'
import { btnDark, btnGhost, btnPrimary, card, inputClass, labelClass } from './ui'

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString('es', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

export default function ProfileView({ user, me }: { user: User, me: StaffMember }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <ProfileSummary user={user} me={me} />
      <div className="flex flex-col gap-6">
        <PersonalDataForm me={me} />
        <PasswordForm />
      </div>
    </div>
  )
}

function ProfileSummary({ user, me }: { user: User, me: StaffMember }) {
  const name = staffName(me)
  const completion = profileCompletion(me)

  const rows = [
    { label: 'Email', value: user.email ?? me.email },
    { label: 'Cargo', value: roleLabel(me.role) },
    { label: 'Teléfono', value: me.phone || '—' },
    { label: 'Cuenta creada', value: formatDateTime(user.created_at) },
    { label: 'Último acceso', value: formatDateTime(user.last_sign_in_at) },
  ]

  return (
    <section className={`${card} flex h-fit flex-col gap-6`} aria-labelledby="perfil-resumen">
      <div className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand text-2xl font-black text-white" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 id="perfil-resumen" className="truncate text-2xl font-black">{name}</h2>
          <p className="truncate text-muted-dark">{roleLabel(me.role)}</p>
        </div>
      </div>

      <div className={`flex flex-col gap-2 rounded-2xl p-4 ${completion.percent === 100 ? 'bg-[#d4ecdc] text-[#1d5c40]' : 'bg-[#ffe8b3] text-[#6b4500]'}`}>
        <p className="font-extrabold">
          Perfil completado al {completion.percent} %
          {completion.missing.length > 0 && <span className="font-semibold"> · falta {completion.missing.join(' y ')}</span>}
        </p>
        <CompletionBar percent={completion.percent} />
      </div>

      <dl className="grid gap-3">
        {rows.map(row => (
          <div key={row.label} className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b-2 border-line pb-3 last:border-0 last:pb-0">
            <dt className="font-extrabold text-muted-dark">{row.label}</dt>
            <dd className="min-w-0 break-words font-semibold">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-sm text-muted-dark">El cargo lo asigna un administrador y define qué puedes ver y hacer en la web.</p>

      <button type="button" className={btnDark} onClick={() => supabase.auth.signOut()}>
        Cerrar sesión
      </button>
    </section>
  )
}

type PersonalData = { fullName: string, phone: string }

function PersonalDataForm({ me }: { me: StaffMember }) {
  const uid = useId()
  const updateMyProfile = usePatientStore(state => state.updateMyProfile)
  const current = { fullName: me.fullName, phone: me.phone }
  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<PersonalData>({
    defaultValues: current
  })

  // Tras guardar, el formulario parte de los datos nuevos
  useEffect(() => { reset({ fullName: me.fullName, phone: me.phone }) }, [me.fullName, me.phone, reset])

  const onSubmit = async (data: PersonalData) => {
    if (!await updateMyProfile({ fullName: data.fullName.trim(), phone: data.phone.trim() })) return
    toast.success('Perfil actualizado')
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className={`${card} flex flex-col gap-5`} aria-labelledby={`${uid}-title`}>
      <h2 id={`${uid}-title`} className="text-2xl font-black">Datos personales</h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor={`${uid}-name`} className={labelClass}>Nombre</label>
          <input
            id={`${uid}-name`}
            autoComplete="name"
            className={inputClass(!!errors.fullName)}
            {...register('fullName', { required: 'El nombre es obligatorio' })}
          />
          {errors.fullName && <Error>{errors.fullName.message}</Error>}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor={`${uid}-phone`} className={labelClass}>Teléfono</label>
          <input
            id={`${uid}-phone`}
            type="tel"
            autoComplete="tel"
            className={inputClass(!!errors.phone)}
            {...register('phone', {
              pattern: { value: /^[+\d\s()-]*$/, message: 'Solo números, espacios y + ( ) -' }
            })}
          />
          {errors.phone && <Error>{errors.phone.message}</Error>}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className={btnGhost} onClick={() => reset(current)} disabled={!isDirty || isSubmitting}>
          Deshacer
        </button>
        <button type="submit" className={btnPrimary} disabled={!isDirty || isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

type PasswordData = { password: string, confirm: string }

function PasswordForm() {
  const uid = useId()
  const { register, handleSubmit, reset, getValues, formState: { errors, isSubmitting } } = useForm<PasswordData>({
    defaultValues: { password: '', confirm: '' }
  })

  const onSubmit = async ({ password }: PasswordData) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(`No se pudo cambiar la contraseña: ${error.message}`)
      return
    }
    toast.success('Contraseña actualizada')
    reset()
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className={`${card} flex flex-col gap-5`} aria-labelledby={`${uid}-title`}>
      <h2 id={`${uid}-title`} className="text-2xl font-black">Cambiar contraseña</h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor={`${uid}-password`} className={labelClass}>Nueva contraseña</label>
          <input
            id={`${uid}-password`}
            type="password"
            autoComplete="new-password"
            className={inputClass(!!errors.password)}
            {...register('password', {
              required: 'Escribe la nueva contraseña',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            })}
          />
          {errors.password && <Error>{errors.password.message}</Error>}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor={`${uid}-confirm`} className={labelClass}>Repite la contraseña</label>
          <input
            id={`${uid}-confirm`}
            type="password"
            autoComplete="new-password"
            className={inputClass(!!errors.confirm)}
            {...register('confirm', {
              required: 'Repite la contraseña',
              validate: value => value === getValues('password') || 'Las contraseñas no coinciden',
            })}
          />
          {errors.confirm && <Error>{errors.confirm.message}</Error>}
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className={btnPrimary} disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </div>
    </form>
  )
}
