import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { usePatientStore } from '../store'
import Login from './Login'
import { PawIcon } from './Icons'
import { btnDark, card } from './ui'

// Muestra el login hasta que haya sesión; con sesión, carga los datos y muestra la app
export default function AuthGate({ children }: { children: React.ReactNode }) {

  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const loadAll = usePatientStore(state => state.loadAll)
  const resetStore = usePatientStore(state => state.reset)
  const loaded = usePatientStore(state => state.loaded)
  const loading = usePatientStore(state => state.loading)
  const me = usePatientStore(state => state.me)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => subscription.unsubscribe()
  }, [])

  const userId = session?.user.id
  useEffect(() => {
    if (userId) loadAll(userId)
    else resetStore()
  }, [userId, loadAll, resetStore])

  if (session === undefined || (session && !loaded && loading)) {
    return <p className="p-10 text-center font-bold text-muted-dark">Cargando…</p>
  }

  if (!session) return <Login />

  if (loaded && !me?.role) {
    return <PendingApproval email={session.user.email ?? ''} onRetry={() => loadAll(session.user.id)} />
  }

  return <>{children}</>
}

function PendingApproval({ email, onRetry }: { email: string, onRetry: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-5 py-10">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-brand text-white">
          <PawIcon />
        </div>
        <span className="text-xl font-black">Veterinaria</span>
      </div>
      <section className={`${card} flex flex-col gap-4`}>
        <h1 className="text-3xl font-black">Cuenta pendiente de aprobación</h1>
        <p className="text-muted-dark">
          Tu cuenta <strong className="text-ink">{email}</strong> está creada, pero aún no tiene un cargo asignado.
          Pide a un administrador de la clínica que te asigne uno desde la sección <strong className="text-ink">Equipo</strong>.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnDark} onClick={onRetry}>Volver a comprobar</button>
          <button
            type="button"
            className="min-h-11 cursor-pointer rounded-full px-4 font-bold text-muted-dark hover:text-ink hover:underline"
            onClick={() => supabase.auth.signOut()}
          >
            Cerrar sesión
          </button>
        </div>
      </section>
    </main>
  )
}
