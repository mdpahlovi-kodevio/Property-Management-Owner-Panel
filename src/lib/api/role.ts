import type { PermissionPayload } from '@/components/form/form-module-map'
import type { Paginated } from './base'
import { request, toQuery } from './base'

export interface Role {
    id: string
    adminId: string
    name: string
    description: string | null
    permissions: PermissionPayload
    createdAt: string
    updatedAt: string
    employees?: {
        id: string
        user: {
            id: string
            name: string
        }
    }[]
}

export interface CreateRolePayload {
    name: string
    description?: string
    permissions: PermissionPayload
}

export interface UpdateRolePayload {
    name?: string
    description?: string
    permissions?: PermissionPayload
}

export const roleApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        request<Paginated<Role>>(`/owner/role${toQuery(params ?? {})}`),
    create: (payload: CreateRolePayload) =>
        request<{ data: Role }>(`/owner/role`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
    update: (id: string, payload: UpdateRolePayload) =>
        request<{ data: Role }>(`/owner/role/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }),
    delete: (id: string) =>
        request<void>(`/owner/role/${id}`, {
            method: 'DELETE',
        }),
}
