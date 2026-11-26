import { AlertIcon } from './Icons'

export default function Error({children} : {children: React.ReactNode}) {
  return (
    <p role="alert" className="flex items-center gap-1.5 text-sm font-semibold text-brand-dark">
      <AlertIcon className="size-4 shrink-0" />
      {children}
    </p>
  )
}
