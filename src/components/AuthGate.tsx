import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { usePatientStore } from '../store'
import Login from './Login'

// Muestra el login hasta que haya sesión; con sesión, carga los datos y muestra la app
export default function AuthGate({ children }: { children: React.ReactNode }) {

  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const loadAll = usePatientStore(state => state.loadAll)
  const resetStore = usePatientStore(state => state.reset)
  const loaded = usePatientStore(state => state.loaded)
  const loading = usePatientStore(state => state.loading)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => subscription.unsubscribe()
  }, [])

  const userId = session?.user.id
  useEffect(() => {
    if (userId) loadAll()
    else resetStore()
  }, [userId, loadAll, resetStore])

  if (session === undefined || (session && !loaded && loading)) {
    return <p className="p-10 text-center font-bold text-muted-dark">Cargando…</p>
  }

  if (!session) return <Login />

  return <>{children}</>
}
