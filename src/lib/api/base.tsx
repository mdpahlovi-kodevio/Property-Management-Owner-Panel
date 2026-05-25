export const baseURL = import.meta.env.VITE_APP_SERVER as string
export const apiPrefix = '/api/v1'

export type Paginated<T> = {
    items: T[]
    total: number
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const isFormData = init?.body instanceof FormData
    const res = await fetch(`${baseURL}${apiPrefix}${path}`, {
        ...init,
        credentials: 'include',
        headers: isFormData ? { ...(init?.headers ?? {}) } : { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = (data && (data.message || data.error)) || `Request failed: ${res.status}`
        throw new Error(Array.isArray(message) ? message.join(', ') : message)
    }

    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
}

export function toQuery(params: Record<string, string | number | boolean | undefined>) {
    const usp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === '') continue
        usp.set(k, String(v))
    }
    const s = usp.toString()
    return s ? `?${s}` : ''
}

export function resolveImage(image: string | null | undefined): string {
    if (!image) return '/placeholder.jpg'
    if (image.startsWith('http://') || image.startsWith('https://')) return image
    if (image.startsWith('/uploads/')) return `${baseURL}${image}`
    return image
}
