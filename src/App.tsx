import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import PatientForm from "./components/PatientForm"
import PatientsList from "./components/PatientsList"
import { PawIcon, PlusIcon, SearchIcon } from './components/Icons'
import "react-toastify/dist/ReactToastify.css"


function App() {

  const [search, setSearch] = useState('')

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

          <div className="relative w-full sm:w-72">
            <label htmlFor="search" className="sr-only">Buscar mascota o dueño</label>
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
            <input
              id="search"
              type="search"
              placeholder="Buscar mascota o dueño"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-full border-2 border-line bg-white py-3 pl-11 pr-5 outline-none transition-colors placeholder:text-muted focus:border-brand"
            />
          </div>
        </header>

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

        <PatientsList search={search} />
        <PatientForm />
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  )
}

export default App
