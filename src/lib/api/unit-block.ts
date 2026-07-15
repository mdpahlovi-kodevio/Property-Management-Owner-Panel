import { request } from './base'

/** UnitBlock shape (matches Prisma `UnitBlock` model). */
export interface UnitBlock {
    id: string
    unitId: string
    fromDate: string // YYYY-MM-DD
    toDate: string // YYYY-MM-DD
    reason: string | null
    createdAt: string
    updatedAt: string
    deletedAt: string | null
}

export interface CreateUnitBlockPayload {
    unitId: string
    fromDate: string // YYYY-MM-DD
    toDate: string // YYYY-MM-DD
    reason?: string
}

export type UpdateUnitBlockPayload = Partial<CreateUnitBlockPayload>

export const unitBlockApi = {
    create: (payload: CreateUnitBlockPayload) =>
        request<{ data: UnitBlock }>(`/owner/unit-block`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    update: (id: string, payload: UpdateUnitBlockPayload) =>
        request<{ data: UnitBlock }>(`/owner/unit-block/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }),

    remove: (id: string) =>
        request<void>(`/owner/unit-block/${id}`, {
            method: 'DELETE',
        }),
}
