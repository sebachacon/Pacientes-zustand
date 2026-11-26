import { useState } from "react"
import { usePatientStore } from "../store"
import PatientDetails from "./PatientDetails"
import { PawIcon } from "./Icons"
import { SPECIES, SPECIES_LABEL, type Patient, type Species } from "../types"
import { daysUntil } from "../utils/date"

type PatientsListProps = {
  search: string
  onEdit: (id: Patient['id']) => void
}

type SortOption = 'recientes' | 'antiguos' | 'nombre' | 'dueno'

const sorters: Record<SortOption, (a: Patient, b: Patient) => number> = {
  recientes: (a, b) => String(b.date).localeCompare(String(a.date)),
  antiguos: (a, b) => String(a.date).localeCompare(String(b.date)),
  nombre: (a, b) => a.name.localeCompare(b.name, 'es'),
  dueno: (a, b) => a.caretaker.localeCompare(b.caretaker, 'es'),
}

const selectClass = 'min-h-11 cursor-pointer rounded-full border-2 border-line bg-white px-4 text-sm font-bold outline-none focus:border-brand'

export default function PatientsList({ search, onEdit }: PatientsListProps) {

  const patients = usePatientStore((state) => state.patients)
  const reminders = usePatientStore((state) => state.reminders)

  const [sort, setSort] = useState<SortOption>('recientes')
  const [species, setSpecies] = useState<Species | 'todas'>('todas')
  const [status, setStatus] = useState<'todos' | 'tratamiento' | 'alta'>('todos')

  const pendingByPatient = new Map<string, number>()
  for (const reminder of reminders) {
    if (!reminder.done && daysUntil(reminder.dueDate) <= 30) {
      pendingByPatient.set(reminder.patientId, (pendingByPatient.get(reminder.patientId) ?? 0) + 1)
    }
  }

  const query = search.trim().toLowerCase()
  const visiblePatients = patients
    .filter(patient => species === 'todas' || patient.species === species)
    .filter(patient => status === 'todos' || (status === 'alta') === !!patient.dischargeDate)
    .filter(patient => !query ||
      patient.name.toLowerCase().includes(query) ||
      patient.caretaker.toLowerCase().includes(query) ||
      patient.breed.toLowerCase().includes(query)
    )
    .sort(sorters[sort])

  return (
    <section aria-labelledby="patients-title">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 id="patients-title" className="text-2xl font-black sm:text-[26px]">Pacientes</h2>
          {patients.length > 0 && (
            <span className="font-bold text-muted">
              {patients.length} {patients.length === 1 ? 'mascota' : 'mascotas'}
            </span>
          )}
        </div>

        {patients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <label htmlFor="filter-status" className="sr-only">Filtrar por estado</label>
            <select
              id="filter-status"
              value={status}
              onChange={e => setStatus(e.target.value as 'todos' | 'tratamiento' | 'alta')}
              className={selectClass}
            >
              <option value="todos">Todos los estados</option>
              <option value="tratamiento">En tratamiento</option>
              <option value="alta">De alta</option>
            </select>

            <label htmlFor="filter-species" className="sr-only">Filtrar por especie</label>
            <select
              id="filter-species"
              value={species}
              onChange={e => setSpecies(e.target.value as Species | 'todas')}
              className={selectClass}
            >
              <option value="todas">Todas las especies</option>
              {SPECIES.map(item => <option key={item} value={item}>{SPECIES_LABEL[item]}</option>)}
            </select>

            <label htmlFor="sort" className="sr-only">Ordenar pacientes</label>
            <select
              id="sort"
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className={selectClass}
            >
              <option value="recientes">Ingreso más reciente</option>
              <option value="antiguos">Ingreso más antiguo</option>
              <option value="nombre">Nombre (A-Z)</option>
              <option value="dueno">Dueño (A-Z)</option>
            </select>
          </div>
        )}
      </div>

      {patients.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-line bg-white/60 px-6 py-14 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-[#ffd9cc] text-brand-dark">
            <PawIcon className="size-8" />
          </div>
          <h3 className="text-xl font-black">No hay pacientes</h3>
          <p className="text-muted-dark">Comienza agregando pacientes y aparecerán en este lugar.</p>
        </div>
      ) : visiblePatients.length === 0 ? (
        <p className="rounded-3xl bg-white px-6 py-10 text-center text-muted-dark">
          Ningún paciente coincide con la búsqueda o el filtro.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
          {visiblePatients.map(patient => (
            <PatientDetails
              key={patient.id}
              patient={patient}
              pendingReminders={pendingByPatient.get(patient.id) ?? 0}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </section>
  )
}
