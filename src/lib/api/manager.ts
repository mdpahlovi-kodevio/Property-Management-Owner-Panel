import type { Paginated } from './base'
import { request, toQuery } from './base'

export interface Manager {
    id: string
    ownerId: string
    userId: string
    createdAt: string
    updatedAt: string
    user: {
        id: string
        name: string
        email: string
        image: string | null
        phone: string | null
        banned: boolean
    }
}

export interface CreateManagerPayload {
    name: string
    email: string
    image: string
    phone: string
    password: string
}

export interface UpdateManagerPayload {
    name?: string
    image?: string
    phone?: string
    status?: 'active' | 'banned'
}

export const managerApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        request<Paginated<Manager>>(`/owner/manager${toQuery(params ?? {})}`),
    listPageLess: () => request<{ data: Manager[] }>(`/owner/manager/page-less`),
    findOne: (id: string) => request<{ data: Manager }>(`/owner/manager/${id}`),
    create: (payload: CreateManagerPayload) =>
        request<{ data: Manager }>(`/owner/manager`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
    update: (id: string, payload: UpdateManagerPayload) =>
        request<{ data: Manager }>(`/owner/manager/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }),
}
