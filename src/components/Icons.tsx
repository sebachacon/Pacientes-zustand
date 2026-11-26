type IconProps = {
  className?: string
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function PawIcon({ className = 'size-6' }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.9} className={className}>
      <circle cx="5.5" cy="10" r="2" />
      <circle cx="9.5" cy="5.5" r="2" />
      <circle cx="14.5" cy="5.5" r="2" />
      <circle cx="18.5" cy="10" r="2" />
      <path d="M12 12c-3 0-6 4-6 6.5 0 1.5 1.2 2.5 2.7 2.5 1.2 0 2.1-.6 3.3-.6s2.1.6 3.3.6c1.5 0 2.7-1 2.7-2.5C18 16 15 12 12 12z" />
    </svg>
  )
}

export function PlusIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg {...base} strokeWidth={2.6} className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

export function EditIcon({ className = 'size-[18px]' }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  )
}

export function TrashIcon({ className = 'size-[18px]' }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </svg>
  )
}

export function SearchIcon({ className = 'size-[18px]' }: IconProps) {
  return (
    <svg {...base} strokeWidth={2.2} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

export function AlertIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg {...base} strokeWidth={2.2} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </svg>
  )
}

export function CheckIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg {...base} strokeWidth={3} className={className}>
      <path d="M5 12l5 5 9-10" />
    </svg>
  )
}
