import { useState } from 'react'
import { usePatientStore } from '../store'
import { profileCompletion } from '../hooks/useUser'
import { CloseIcon } from './Icons'
import { btnDark } from './ui'

const DISMISS_KEY = 'perfil-recordatorio-oculto'

const joinList = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`

/** Barra de progreso del perfil, también usada en «Mi perfil». */
export function CompletionBar({ percent }: { percent: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Perfil completado"
      className="h-2.5 w-full overflow-hidden rounded-full bg-white/70"
    >
      <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${percent}%` }} />
    </div>
  )
}

// Recordatorio en la parte superior mientras el perfil no esté al 100 %.
// Se puede ocultar durante la sesión del navegador; vuelve a aparecer en la siguiente.
export default function ProfileReminder({ onComplete }: { onComplete: () => void }) {
  const me = usePatientStore(state => state.me)
  const [hidden, setHidden] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1')
  const { percent, missing } = profileCompletion(me)

  if (!me || percent === 100 || hidden) return null

  const hide = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setHidden(true)
  }

  return (
    <section
      aria-label="Perfil incompleto"
      className="flex flex-wrap items-center gap-4 rounded-2xl bg-[#ffe8b3] p-5 text-[#6b4500]"
    >
      <div className="flex min-w-0 flex-[1_1_18rem] flex-col gap-2">
        <p>
          <strong className="font-black">Tu perfil está al {percent} %.</strong>{' '}
          Falta {joinList(missing)} para que el equipo pueda identificarte y contactarte.
        </p>
        <CompletionBar percent={percent} />
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className={btnDark} onClick={onComplete}>Completar perfil</button>
        <button
          type="button"
          onClick={hide}
          aria-label="Ocultar recordatorio"
          title="Ocultar por ahora"
          className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-black/10"
        >
          <CloseIcon />
        </button>
      </div>
    </section>
  )
}
