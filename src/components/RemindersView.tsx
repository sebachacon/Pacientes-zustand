import { usePatientStore } from '../store'
import type { Reminder } from '../types'
import { daysUntil } from '../utils/date'
import ReminderForm from './ReminderForm'
import { ReminderItem } from './ScheduleItems'
import { card } from './ui'

export default function RemindersView() {

  const reminders = usePatientStore(state => state.reminders)

  const byDue = (a: Reminder, b: Reminder) => a.dueDate.localeCompare(b.dueDate)
  const pending = reminders.filter(r => !r.done).sort(byDue)

  const groups = [
    { id: 'vencidos', title: 'Vencidos', items: pending.filter(r => daysUntil(r.dueDate) < 0), tone: 'text-brand-dark' },
    { id: 'semana', title: 'Esta semana', items: pending.filter(r => { const d = daysUntil(r.dueDate); return d >= 0 && d <= 7 }), tone: 'text-[#6b4500]' },
    { id: 'mes', title: 'Próximos 30 días', items: pending.filter(r => { const d = daysUntil(r.dueDate); return d > 7 && d <= 30 }), tone: 'text-ink' },
    { id: 'despues', title: 'Más adelante', items: pending.filter(r => daysUntil(r.dueDate) > 30), tone: 'text-ink' },
    { id: 'hechos', title: 'Completados', items: reminders.filter(r => r.done).sort(byDue).reverse(), tone: 'text-muted' },
  ]

  const summary = groups.slice(0, 3)

  return (
    <div className="flex flex-col gap-7">
      <section className="grid gap-4 sm:grid-cols-3" aria-label="Resumen de recordatorios">
        {summary.map(group => (
          <a key={group.id} href={`#grupo-${group.id}`} className={`${card} flex flex-col gap-1 no-underline transition-transform hover:-translate-y-0.5`}>
            <span className="text-sm font-extrabold tracking-wide text-muted uppercase">{group.title}</span>
            <span className={`text-4xl font-black ${group.tone}`}>{group.items.length}</span>
          </a>
        ))}
      </section>

      <div className="flex flex-wrap items-start gap-7">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-7">
          {reminders.length === 0 && (
            <p className={`${card} text-muted-dark`}>
              Aún no hay recordatorios. Crea el primero para no olvidar vacunas ni desparasitaciones.
            </p>
          )}
          {groups.filter(group => group.items.length > 0).map(group => (
            <section key={group.id} id={`grupo-${group.id}`} aria-labelledby={`titulo-${group.id}`} className="scroll-mt-6">
              <h2 id={`titulo-${group.id}`} className={`mb-3 text-xl font-black ${group.tone}`}>
                {group.title} <span className="text-base text-muted">({group.items.length})</span>
              </h2>
              <ul className="flex flex-col gap-3">
                {group.items.map(reminder => <ReminderItem key={reminder.id} reminder={reminder} />)}
              </ul>
            </section>
          ))}
        </div>

        <section className={`${card} min-w-0 flex-[1_1_340px]`} aria-labelledby="new-reminder-title">
          <h2 id="new-reminder-title" className="mb-4 text-xl font-black">Nuevo recordatorio</h2>
          <ReminderForm />
        </section>
      </div>
    </div>
  )
}
