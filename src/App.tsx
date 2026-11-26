import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import PatientForm from "./components/PatientForm"
import PatientsList from "./components/PatientsList"
import PatientDetailModal from './components/PatientDetailModal'
import AgendaView from './components/AgendaView'
import RemindersView from './components/RemindersView'
import { BellIcon, CalendarIcon, PawIcon, PlusIcon, SearchIcon } from './components/Icons'
import { usePatientStore } from './store'
import { daysUntil, todayYMD } from './utils/date'
import "react-toastify/dist/ReactToastify.css"

type View = 'pacientes' | 'agenda' | 'recordatorios'

function App() {

  const [view, setView] = useState<View>('pacientes')
  const [search, setSearch] = useState('')

  const appointments = usePatientStore(state => state.appointments)
  const reminders = usePatientStore(state => state.reminders)
  const getPatientById = usePatientStore(state => state.getPatientById)
  const closeDetail = usePatientStore(state => state.closeDetail)

  const today = todayYMD()
  const todaysAppointments = appointments.filter(a => a.date === today).length
  const urgentReminders = reminders.filter(r => !r.done && daysUntil(r.dueDate) <= 7).length

  const editPatient = (id: string) => {
    closeDetail()
    getPatientById(id)
    setView('pacientes')
    // Espera a que se pinte la vista de pacientes antes de desplazarse al formulario
    requestAnimationFrame(() => {
      document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  const navItems: { id: View, label: string, badge: number }[] = [
    { id: 'pacientes', label: 'Pacientes', badge: 0 },
    { id: 'agenda', label: 'Agenda', badge: todaysAppointments },
    { id: 'recordatorios', label: 'Recordatorios', badge: urgentReminders },
  ]

  return (
    <>
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-7 sm:px-7 pb-14">

        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-brand text-white">
              <PawIcon />
            </div>
            <span className="text-xl font-black">Veterinaria</span>
          </div>

          <nav aria-label="Secciones" className="order-last flex w-full gap-1 overflow-x-auto rounded-full bg-white p-1.5 shadow-[0_2px_0_var(--color-line)] md:order-none md:w-auto">
            {navItems.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                aria-current={view === item.id ? 'page' : undefined}
                className={`inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-5 font-extrabold whitespace-nowrap transition-colors md:flex-none ${
                  view === item.id ? 'bg-ink text-white' : 'text-muted-dark hover:text-ink'
                }`}
              >
                {item.label}
                {item.badge > 0 && (
                  <span className="rounded-full bg-brand px-2 text-xs leading-5 text-white">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

          {view === 'pacientes' ? (
            <div className="relative w-full sm:w-72">
              <label htmlFor="search" className="sr-only">Buscar mascota, raza o dueño</label>
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
              <input
                id="search"
                type="search"
                placeholder="Buscar mascota, raza o dueño"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-full border-2 border-line bg-white py-3 pl-11 pr-5 outline-none transition-colors placeholder:text-muted focus:border-brand"
              />
            </div>
          ) : (
            <div className="hidden sm:block sm:w-72" aria-hidden="true" />
          )}
        </header>

        {view === 'pacientes' && (
          <>
            <section className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[28px] bg-ink px-8 py-9 text-cream sm:px-10">
              <PawIcon className="pointer-events-none absolute -top-10 right-72 size-56 -rotate-[18deg] text-[#4a342c] [stroke-width:1.2]" />
              <div className="relative max-w-2xl">
                <h1 className="text-4xl leading-[1.05] font-black sm:text-5xl">
                  Seguimiento de Pacientes {''}
                  <span className="text-brand-soft">Veterinaria</span>
                </h1>
                <p className="mt-3 text-lg text-[#e7d6ce]">
                  Registra cada mascota, su dueño y sus síntomas. Edítalos o elimínalos cuando lo necesites.
                </p>
              </div>
              <a
                href="#registro"
                className="relative inline-flex items-center gap-2.5 rounded-full bg-brand px-7 py-4 text-lg font-extrabold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-soft"
              >
                <PlusIcon />
                Registrar paciente
              </a>
            </section>

            {(todaysAppointments > 0 || urgentReminders > 0) && (
              <div className="flex flex-wrap gap-3">
                {todaysAppointments > 0 && (
                  <button type="button" onClick={() => setView('agenda')} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-5 font-extrabold shadow-[0_2px_0_var(--color-line)] hover:text-brand-dark">
                    <CalendarIcon /> {todaysAppointments} {todaysAppointments === 1 ? 'cita hoy' : 'citas hoy'}
                  </button>
                )}
                {urgentReminders > 0 && (
                  <button type="button" onClick={() => setView('recordatorios')} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#ffe8b3] px-5 font-extrabold text-[#6b4500] hover:bg-[#ffdf94]">
                    <BellIcon /> {urgentReminders} {urgentReminders === 1 ? 'recordatorio vencido o por vencer' : 'recordatorios vencidos o por vencer'} esta semana
                  </button>
                )}
              </div>
            )}

            <PatientsList search={search} onEdit={editPatient} />
            <PatientForm />
          </>
        )}

        {view === 'agenda' && (
          <>
            <h1 className="text-4xl font-black">Agenda</h1>
            <AgendaView />
          </>
        )}

        {view === 'recordatorios' && (
          <>
            <h1 className="text-4xl font-black">Vacunas y desparasitación</h1>
            <RemindersView />
          </>
        )}
      </div>

      <PatientDetailModal onEdit={editPatient} />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  )
}

export default App
