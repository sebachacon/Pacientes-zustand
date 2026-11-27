import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { supabase } from '../lib/supabase'
import Error from './Error'
import { PawIcon } from './Icons'
import { btnPrimary, card, inputClass, labelClass } from './ui'

type Credentials = { email: string, password: string }
type Mode = 'signIn' | 'signUp'

export default function Login() {

  const [mode, setMode] = useState<Mode>('signIn')
  const uid = useId()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Credentials>({
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = async ({ email, password }: Credentials) => {
    if (mode === 'signIn') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) toast.error(error.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos'
        : error.message)
      return
    }

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      toast.error(error.message)
      return
    }
    if (!data.session) {
      toast.info('Te enviamos un email para confirmar la cuenta. Confírmala y luego inicia sesión.')
      setMode('signIn')
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-5 py-10">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-brand text-white">
          <PawIcon />
        </div>
        <span className="text-xl font-black">Veterinaria</span>
      </div>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className={`${card} flex flex-col gap-5`}>
        <h1 className="text-3xl font-black">
          {mode === 'signIn' ? 'Iniciar sesión' : 'Crear cuenta'}
        </h1>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-email`} className={labelClass}>Email</label>
          <input
            id={`${uid}-email`}
            type="email"
            autoComplete="email"
            className={inputClass(!!errors.email)}
            {...register('email', {
              required: 'El email es obligatorio',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email no válido' },
            })}
          />
          {errors.email && <Error>{errors.email.message}</Error>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-password`} className={labelClass}>Contraseña</label>
          <input
            id={`${uid}-password`}
            type="password"
            autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
            className={inputClass(!!errors.password)}
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            })}
          />
          {errors.password && <Error>{errors.password.message}</Error>}
        </div>

        <button type="submit" className={btnPrimary} disabled={isSubmitting}>
          {isSubmitting ? 'Un momento…' : mode === 'signIn' ? 'Entrar' : 'Crear cuenta'}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
          className="cursor-pointer text-center font-bold text-muted-dark underline-offset-4 hover:text-ink hover:underline"
        >
          {mode === 'signIn' ? '¿No tienes cuenta? Crea una' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </form>
    </main>
  )
}
