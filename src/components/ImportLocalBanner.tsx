import { useState } from 'react'
import { toast } from 'react-toastify'
import { usePatientStore } from '../store'
import { useCan } from '../hooks/useUser'
import { archiveLocalData, importLocalData, readLocalData } from '../utils/importLocal'
import { btnGhost, btnPrimary } from './ui'

// Ofrece subir a Supabase los datos que la versión anterior guardaba en este navegador
export default function ImportLocalBanner() {

  const [data, setData] = useState(readLocalData)
  const [busy, setBusy] = useState(false)
  const loadAll = usePatientStore(state => state.loadAll)
  const me = usePatientStore(state => state.me)
  // La importación incluye la ficha clínica, así que solo la ofrecemos a quien puede registrarla
  const allowed = useCan('addConsultation')

  if (!data || !me || !allowed) return null

  const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
  const summary = [
    count(data.patients.length, 'paciente', 'pacientes'),
    count(data.consultations.length, 'consulta', 'consultas'),
    count(data.appointments.length, 'cita', 'citas'),
    count(data.reminders.length, 'recordatorio', 'recordatorios'),
  ].join(', ')

  const runImport = async () => {
    setBusy(true)
    try {
      await importLocalData(data)
      archiveLocalData()
      await loadAll(me.userId)
      toast.success(`Importados: ${summary}`)
      setData(null)
    } catch (error) {
      toast.error(`No se pudo importar: ${(error as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  const dismiss = () => {
    archiveLocalData()
    setData(null)
    toast.info('Datos locales descartados (queda una copia de respaldo en este navegador)')
  }

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#d9e2ff] p-5 text-[#1f3380]">
      <div className="min-w-0 flex-[1_1_20rem]">
        <p className="font-black">Hay datos guardados en este navegador</p>
        <p>{summary}. ¿Quieres subirlos a la base de datos?</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnGhost} onClick={dismiss} disabled={busy}>Descartar</button>
        <button type="button" className={btnPrimary} onClick={runImport} disabled={busy}>
          {busy ? 'Importando…' : 'Importar'}
        </button>
      </div>
    </section>
  )
}
