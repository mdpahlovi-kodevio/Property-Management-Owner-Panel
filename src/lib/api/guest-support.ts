import type { Paginated } from './base'
import { request, toQuery } from './base'

export const GuestSupportTicketCategoryOptions = [
    'GENERAL',
    'ACCOUNT',
    'BOOKING_PROBLEM',
    'PAYMENT_BILLING',
    'PROPERTY_COMPLAINT',
    'SAFETY_SECURITY',
    'TECHNICAL',
    'OTHER',
] as const
export type GuestSupportTicketCategory = (typeof GuestSupportTicketCategoryOptions)[number]

export const GuestSupportTicketPriorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const
export type GuestSupportTicketPriority = (typeof GuestSupportTicketPriorityOptions)[number]

export const GuestSupportTicketStatusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'SPAM'] as const
export type GuestSupportTicketStatus = (typeof GuestSupportTicketStatusOptions)[number]

export interface GuestSupportTicket {
    id: string
    reference: string
    ownerId: string
    websiteId: string
    websiteName: string
    propertyId: string | null
    propertyName: string | null
    guestId: string
    guestUserId: string
    guestName: string
    guestEmail: string
    guestAvatar: string | null
    assignedToId: string | null
    assignedToName: string | null
    title: string
    description: string
    category: GuestSupportTicketCategory
    priority: GuestSupportTicketPriority
    status: GuestSupportTicketStatus
    resolutionNote: string | null
    lastGuestReplyAt: string | null
    lastOwnerReplyAt: string | null
    lastActivityAt: string
    resolvedAt: string | null
    closedAt: string | null
    createdAt: string
    updatedAt: string
    messageCount: number
}

export interface GuestSupportMessage {
    id: string
    senderUserId: string
    sender: { id: string; name: string; email: string; image: string | null }
    message: string
    createdAt: string
}

export interface GuestSupportMessagePage {
    data: GuestSupportMessage[]
    meta: { hasMore: boolean; nextCursor: string | null }
}

export interface ListGuestSupportParams {
    page?: number
    limit?: number
    status?: GuestSupportTicketStatus
    priority?: GuestSupportTicketPriority
    category?: GuestSupportTicketCategory
    search?: string
    propertyId?: string
    assignedToId?: string
}

const root = '/owner/guest-support-tickets'

export const guestSupportApi = {
    listTickets: (params?: ListGuestSupportParams) => request<Paginated<GuestSupportTicket>>(`${root}${toQuery(params ?? {})}`),

    getTicket: (id: string) => request<{ data: GuestSupportTicket }>(`${root}/${id}`),

    listMessages: (ticketId: string, params?: { cursor?: string; limit?: number }) =>
        request<GuestSupportMessagePage>(`${root}/${ticketId}/messages${toQuery(params ?? {})}`),

    sendMessage: (ticketId: string, payload: { message: string }) =>
        request<{ data: GuestSupportTicket }>(`${root}/${ticketId}/messages`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    updateStatus: (ticketId: string, status: GuestSupportTicketStatus, resolutionNote?: string) =>
        request<{ data: GuestSupportTicket }>(`${root}/${ticketId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, resolutionNote }),
        }),

    updatePriority: (ticketId: string, priority: GuestSupportTicketPriority) =>
        request<{ data: GuestSupportTicket }>(`${root}/${ticketId}/priority`, {
            method: 'PATCH',
            body: JSON.stringify({ priority }),
        }),

    assign: (ticketId: string, ownerEmployeeId?: string) =>
        request<{ data: GuestSupportTicket }>(`${root}/${ticketId}/assignment`, {
            method: 'PATCH',
            body: JSON.stringify({ ownerEmployeeId }),
        }),
}
