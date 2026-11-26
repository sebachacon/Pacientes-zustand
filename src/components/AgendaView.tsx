import { useState } from 'react'
import { usePatientStore } from '../store'
import { formatDate, toYMD, todayYMD } from '../utils/date'
import AppointmentForm from './AppointmentForm'
import { AppointmentItem } from './ScheduleItems'
import { ChevronIcon } from './Icons'
import { card, iconBtn } from './ui'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const buildMonth = (year: number, month: number) => {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7 // lunes = 0
  const start = new Date(year, month, 1 - offset)
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { ymd: toYMD(date), day: date.getDate(), inMonth: date.getMonth() === month }
  })
}

export default function AgendaView() {

  const appointments = usePatientStore(state => state.appointments)
  const today = todayYMD()

  const [selected, setSelected] = useState(today)
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const byDay = new Map<string, number>()
  for (const appointment of appointments) {
    byDay.set(appointment.date, (byDay.get(appointment.date) ?? 0) + 1)
  }

  const sortByTime = (list: typeof appointments) => [...list].sort((a, b) => a.time.localeCompare(b.time))
  const todays = sortByTime(appointments.filter(a => a.date === today))
  const selectedDay = sortByTime(appointments.filter(a => a.date === selected))
  const upcoming = [...appointments]
    .filter(a => a.date > today)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 5)

  const days = buildMonth(cursor.year, cursor.month)
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('es', { month: 'long', year: 'numeric' })

  const moveMonth = (delta: number) => {
    setCursor(({ year, month }) => {
      const date = new Date(year, month + delta, 1)
      return { year: date.getFullYear(), month: date.getMonth() }
    })
  }

  const goToday = () => {
    const now = new Date()
    setCursor({ year: now.getFullYear(), month: now.getMonth() })
    setSelected(today)
  }

  return (
    <div className="flex flex-col gap-7">
      <section aria-labelledby="today-title" className="rounded-[28px] bg-ink p-6 text-cream sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="today-title" className="text-2xl font-black sm:text-3xl">Citas de hoy</h2>
          <span className="font-bold text-[#e7d6ce] first-letter:uppercase">
            {formatDate(today, { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        {todays.length === 0 ? (
          <p className="mt-4 text-[#e7d6ce]">No hay citas para hoy.</p>
        ) : (
          <ul className="mt-5 grid gap-3 text-ink md:grid-cols-2">
            {todays.map(a => <AppointmentItem key={a.id} appointment={a} showDate={false} />)}
          </ul>
        )}
      </section>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <section aria-labelledby="calendar-title" className={`${card} min-w-0 self-start`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="calendar-title" className="text-2xl font-black first-letter:uppercase">{monthLabel}</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => moveMonth(-1)} aria-label="Mes anterior" className={iconBtn}>
                <ChevronIcon direction="left" />
              </button>
              <button type="button" onClick={goToday} className="min-h-11 cursor-pointer rounded-full border-2 border-line px-4 font-extrabold hover:border-ink">
                Hoy
              </button>
              <button type="button" onClick={() => moveMonth(1)} aria-label="Mes siguiente" className={iconBtn}>
                <ChevronIcon direction="right" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map(day => (
              <div key={day} className="pb-1 text-xs font-extrabold tracking-wide text-muted uppercase">{day}</div>
            ))}
            {days.map(day => {
              const count = byDay.get(day.ymd) ?? 0
              const isSelected = day.ymd === selected
              const isToday = day.ymd === today
              return (
                <button
                  key={day.ymd}
                  type="button"
                  onClick={() => setSelected(day.ymd)}
                  aria-pressed={isSelected}
                  aria-label={`${formatDate(day.ymd, { weekday: 'long', day: 'numeric', month: 'long' })}${count ? `, ${count} ${count === 1 ? 'cita' : 'citas'}` : ''}`}
                  className={`flex h-11 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl text-sm font-extrabold transition-colors sm:h-12 ${
                    isSelected ? 'bg-brand text-white'
                    : isToday ? 'bg-ink text-white'
                    : day.inMonth ? 'bg-cream hover:bg-line'
                    : 'text-muted/60 hover:bg-cream'
                  }`}
                >
                  {day.day}
                  {count > 0 && (
                    <span className={`rounded-full px-1.5 text-[10px] leading-3.5 ${isSelected || isToday ? 'bg-white/25' : 'bg-brand text-white'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="day-title" className="flex min-w-0 flex-col gap-5">
          <div className={card}>
            <h2 id="day-title" className="mb-4 text-xl font-black first-letter:uppercase">
              {formatDate(selected, { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            {selectedDay.length === 0 ? (
              <p className="text-muted-dark">Sin citas este día.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {selectedDay.map(a => <AppointmentItem key={a.id} appointment={a} showDate={false} />)}
              </ul>
            )}
          </div>

          <div className={card}>
            <h2 className="mb-4 text-xl font-black">Agendar cita</h2>
            <AppointmentForm defaultDate={selected} />
          </div>
        </section>
      </div>

      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-title">
          <h2 id="upcoming-title" className="mb-4 text-2xl font-black">Próximas citas</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {upcoming.map(a => <AppointmentItem key={a.id} appointment={a} />)}
          </ul>
        </section>
      )}
    </div>
  )
}
