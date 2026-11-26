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

export function CloseIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg {...base} strokeWidth={2.2} className={className}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  )
}

export function PhoneIcon({ className = 'size-[18px]' }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  )
}

export function ChatIcon({ className = 'size-[18px]' }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.5A8.4 8.4 0 1 1 21 11.5z" />
    </svg>
  )
}

export function MailIcon({ className = 'size-[18px]' }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

export function CalendarIcon({ className = 'size-[18px]' }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  )
}

export function BellIcon({ className = 'size-[18px]' }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
    </svg>
  )
}

export function ClipboardIcon({ className = 'size-[18px]' }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </svg>
  )
}

export function CopyIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

export function ChevronIcon({ className = 'size-5', direction = 'right' }: IconProps & { direction?: 'left' | 'right' }) {
  return (
    <svg {...base} strokeWidth={2.4} className={className}>
      <path d={direction === 'right' ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
    </svg>
  )
}

export function ClockIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}
