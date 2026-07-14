import type { Paginated } from './base'
import { request, toQuery } from './base'

// ── Enums ──────────────────────────────────────────────────────────────────

export const SupportTicketStatusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'] as const
export type SupportTicketStatus = (typeof SupportTicketStatusOptions)[number]

export const SupportTicketPriorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const
export type SupportTicketPriority = (typeof SupportTicketPriorityOptions)[number]

export const SupportTicketCategoryOptions = [
    'GENERAL',
    'ACCOUNT',
    'BILLING',
    'SUBSCRIPTION',
    'PROPERTY_MANAGEMENT',
    'WEBSITE_BUILDER',
    'BOOKING_SYSTEM',
    'PAYMENT_GATEWAY',
    'TECHNICAL',
    'BUG_REPORT',
    'FEATURE_REQUEST',
] as const
export type SupportTicketCategory = (typeof SupportTicketCategoryOptions)[number]

// ── Types ───────────────────────────────────────────────────────────────────

export interface SupportTicketUser {
    id: string
    name: string
    email: string
    image: string | null
}

export interface SupportTicketMessage {
    id: string
    senderUserId: string
    sender: SupportTicketUser
    message: string
    createdAt: string
    attachments: SupportTicketAttachment[]
}

export interface SupportTicketAttachment {
    id: string
    fileName: string
    fileUrl: string
    mimeType: string
    fileSize: number
    createdAt: string
}

export interface SupportTicketStatusHistory {
    id: string
    fromStatus: string | null
    toStatus: string
    reason: string | null
    createdAt: string
    actor: { id: string; name: string } | null
}

export interface SupportTicketInternalNote {
    id: string
    authorId: string
    author: SupportTicketUser
    note: string
    createdAt: string
}

export interface SupportTicket {
    id: string
    reference: string
    ownerId: string
    createdByUserId: string
    assignedToId: string | null
    title: string
    description: string
    category: SupportTicketCategory
    priority: SupportTicketPriority
    status: SupportTicketStatus
    resolutionNote: string | null
    lastOwnerReplyAt: string | null
    lastAdminReplyAt: string | null
    lastActivityAt: string
    resolvedAt: string | null
    closedAt: string | null
    createdAt: string
    updatedAt: string
    deletedAt: string | null
    owner: { id: string; companyName: string | null; userId: string }
    createdBy: SupportTicketUser
    assignedTo: { id: string; user: SupportTicketUser } | null
    attachments: SupportTicketAttachment[]
    statusHistory: SupportTicketStatusHistory[]
    internalNotes: SupportTicketInternalNote[]
}

export interface SupportMessagePage {
    data: SupportTicketMessage[]
    meta: { hasMore: boolean; nextCursor: string | null }
}

// ── Query / payload types ───────────────────────────────────────────────────

export interface ListTicketParams {
    page?: number
    limit?: number
    status?: SupportTicketStatus
    priority?: SupportTicketPriority
    category?: SupportTicketCategory
    search?: string
}

export interface CreateTicketPayload {
    title: string
    description: string
    category?: SupportTicketCategory
    priority?: SupportTicketPriority
    attachments?: { fileName: string; fileUrl: string; mimeType: string; fileSize: number }[]
}

export interface SendMessagePayload {
    message: string
    attachments?: { fileName: string; fileUrl: string; mimeType: string; fileSize: number }[]
}

// ── API ─────────────────────────────────────────────────────────────────────

export const supportApi = {
    listTickets: (params?: Record<string, string | number | boolean | undefined>) =>
        request<Paginated<SupportTicket>>(`/owner/support-tickets${toQuery(params ?? {})}`),

    getTicket: (id: string) => request<{ data: SupportTicket }>(`/owner/support-tickets/${id}`),

    createTicket: (payload: CreateTicketPayload) =>
        request<{ data: SupportTicket }>('/owner/support-tickets', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    sendMessage: (ticketId: string, payload: SendMessagePayload) =>
        request<{ data: SupportTicket }>(`/owner/support-tickets/${ticketId}/messages`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    listMessages: (ticketId: string, params?: { cursor?: string; limit?: number }) =>
        request<SupportMessagePage>(`/owner/support-tickets/${ticketId}/messages${toQuery(params ?? {})}`),
}
