import type { Patient } from '../types'

const tints = [
  { bg: 'bg-[#ffd9cc]', ink: 'text-[#b8361f]' },
  { bg: 'bg-[#d4ecdc]', ink: 'text-[#24704f]' },
  { bg: 'bg-[#d9e2ff]', ink: 'text-[#3049b8]' },
  { bg: 'bg-[#ffe8b3]', ink: 'text-[#8a5a00]' },
  { bg: 'bg-[#ecdcf5]', ink: 'text-[#7a2e99]' },
]

export const tintFor = (id: string) => {
  let hash = 0
  for (const char of id) hash = (hash + char.charCodeAt(0)) % tints.length
  return tints[hash]
}

export const initialOf = (patient: Patient) => patient.name.charAt(0).toUpperCase()

export const formatAge = (age: number | null) => {
  if (age === null || age === undefined) return ''
  if (age < 1) {
    const months = Math.round(age * 12)
    return `${months} ${months === 1 ? 'mes' : 'meses'}`
  }
  return `${age} ${age === 1 ? 'año' : 'años'}`
}

export const formatWeight = (weight: number | null) =>
  weight === null || weight === undefined ? '' : `${weight} kg`
