// Clases compartidas de Tailwind para mantener los formularios y botones consistentes

export const inputClass = (hasError = false) =>
    `w-full min-w-0 rounded-2xl border-2 bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-muted focus:border-brand ${
        hasError ? 'border-brand-dark bg-danger-soft' : 'border-line'
    }`

export const labelClass = 'text-[15px] font-extrabold'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

export const btnPrimary =
    `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-6 font-extrabold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`

export const btnDark =
    `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-6 font-extrabold text-white transition-colors hover:bg-black ${focusRing}`

export const btnGhost =
    `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-line bg-white px-5 font-extrabold text-muted-dark transition-colors hover:border-muted disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`

export const btnDanger =
    `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-dark px-6 font-extrabold text-white transition-colors hover:bg-[#8f2614] ${focusRing}`

export const iconBtn =
    `flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-line bg-white text-ink transition-colors hover:border-ink ${focusRing}`

export const iconBtnDanger =
    `flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-danger-line bg-danger-soft text-brand-dark transition-colors hover:border-brand-dark ${focusRing}`

export const chip = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold'

export const card = 'rounded-3xl bg-white p-6 shadow-[0_2px_0_var(--color-line)]'
