import type { Paginated } from './base'
import { request, toQuery } from './base'

export interface Employee {
    id: string
    adminId: string
    userId: string
    roleId: string
    invitedById: string | null
    invitedAt: string
    acceptedAt: string | null
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
    role: {
        id: string
        name: string
        permissions: any
    }
}

export interface CreateEmployeePayload {
    name: string
    email: string
    image: string
    phone: string
    roleId: string
    password: string
}

export interface UpdateEmployeePayload {
    name?: string
    image?: string
    phone?: string
    roleId?: string
    status?: 'active' | 'banned'
}

export const employeeApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        request<Paginated<Employee>>(`/owner/employee${toQuery(params ?? {})}`),
    create: (payload: CreateEmployeePayload) =>
        request<{ data: Employee }>(`/owner/employee`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
    update: (id: string, payload: UpdateEmployeePayload) =>
        request<{ data: Employee }>(`/owner/employee/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }),
    delete: (id: string) =>
        request<void>(`/owner/employee/${id}`, {
            method: 'DELETE',
        }),
}

// Keep a backward compatible alias just in case
export const employee = employeeApi
