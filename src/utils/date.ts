const pad = (n: number) => String(n).padStart(2, '0')

export const toYMD = (date: Date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const todayYMD = () => toYMD(new Date())

export const parseYMD = (value: string) => new Date(`${value}T00:00:00`)

export const formatDate = (
    value: string,
    options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
) => {
    const date = parseYMD(String(value))
    if (Number.isNaN(date.getTime())) return String(value)
    return date.toLocaleDateString('es', options)
}

export const daysUntil = (value: string) =>
    Math.round((parseYMD(value).getTime() - parseYMD(todayYMD()).getTime()) / 86_400_000)

export const relativeDays = (days: number) => {
    if (days === 0) return 'hoy'
    if (days === 1) return 'mañana'
    if (days === -1) return 'ayer'
    return days > 0 ? `en ${days} días` : `hace ${-days} días`
}
