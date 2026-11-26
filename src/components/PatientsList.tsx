import { usePatientStore } from "../store"
import PatientDetails from "./PatientDetails"
import { PawIcon } from "./Icons"

type PatientsListProps = {
  search: string
}

export default function PatientsList({ search }: PatientsListProps) {

  const patients = usePatientStore((state) => state.patients)

  const query = search.trim().toLowerCase()
  const visiblePatients = query
    ? patients.filter(patient =>
        patient.name.toLowerCase().includes(query) ||
        patient.caretaker.toLowerCase().includes(query)
      )
    : patients

  return (
    <section aria-labelledby="patients-title">
      <div className="mb-5 flex items-baseline gap-3">
        <h2 id="patients-title" className="text-2xl font-black sm:text-[26px]">Pacientes</h2>
        {patients.length > 0 && (
          <span className="font-bold text-muted">
            {patients.length} {patients.length === 1 ? 'mascota' : 'mascotas'}
          </span>
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
          Ningún paciente coincide con <span className="font-bold text-ink">“{search}”</span>.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {visiblePatients.map(patient => (
            <PatientDetails
              key={patient.id}
              patient={patient}
            />
          ))}
        </div>
      )}
    </section>
  )
}
