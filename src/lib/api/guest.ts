import type { Paginated } from './base'
import { request, toQuery } from './base'

// ── Shapes returned by the backend ────────────────────────────────────────
export interface GuestUser {
    id: string
    name: string
    email: string
    image: string | null
    phone: string | null
    banned: boolean
}

export interface GuestWebsite {
    id: string
    name: string
    subdomain: string
    customDomain: string | null
}

export interface Guest {
    id: string
    userId: string
    websiteId: string
    createdAt: string
    updatedAt: string
    user: GuestUser
    website: GuestWebsite
}

export interface CreateGuestPayload {
    name: string
    email: string
    image?: string
    phone?: string
    websiteId: string
    password?: string
}

export interface UpdateGuestPayload {
    name?: string
    image?: string
    phone?: string
    status?: 'active' | 'banned'
}

// ── API surface ───────────────────────────────────────────────────────────

export const guestApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        request<Paginated<Guest>>(`/owner/guest${toQuery(params ?? {})}`),
    listPageLess: () => request<{ data: Guest[] }>(`/owner/guest/page-less`),
    create: (payload: CreateGuestPayload) =>
        request<{ data: Guest }>(`/owner/guest`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
    update: (id: string, payload: UpdateGuestPayload) =>
        request<{ data: Guest }>(`/owner/guest/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }),
}
