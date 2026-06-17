import { queryClient } from '@/main'
import { SessionKey } from './auth'

export const baseURL = import.meta.env.VITE_APP_SERVER as string
export const apiPrefix = '/api/v1'

export type Paginated<T> = {
    data: T[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
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

        if (data?.statusCode === 401) {
            queryClient.setQueryData(SessionKey, null)
        }

        const message = data?.message ?? 'Something went wrong'
        throw new Error(message)
    }

    if (res.status === 204) return null as T
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
