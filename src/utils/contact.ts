export const phoneDigits = (phone: string) => phone.replace(/\D/g, '')

export const telUrl = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

export const whatsappUrl = (phone: string) => `https://wa.me/${phoneDigits(phone)}`
