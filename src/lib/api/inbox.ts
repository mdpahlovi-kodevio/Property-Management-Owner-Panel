import type { Paginated } from './base'
import { request, toQuery } from './base'
import type { GuestSupportMessage, GuestSupportMessagePage } from './guest-support'

export interface BookingConversation {
    conversationId: string | null
    bookingId: string
    bookingReference: string
    bookingStatus: string
    propertyId: string
    propertyName: string
    roomTypeName: string
    roomNumber: string
    checkInDate: string
    checkOutDate: string
    guest: { id: string; name: string; email: string; image: string | null }
    lastActivityAt: string
    lastMessage: GuestSupportMessage | null
    unreadCount: number
    canReply: boolean
}

const root = '/owner/inbox'

export const inboxApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        request<Paginated<BookingConversation>>(`${root}${toQuery(params ?? {})}`),

    listMessages: (bookingId: string, params?: { cursor?: string; limit?: number }) =>
        request<GuestSupportMessagePage>(`${root}/bookings/${bookingId}/messages${toQuery(params ?? {})}`),

    sendMessage: (bookingId: string, message: string) =>
        request<{ data: { id: string; message: GuestSupportMessage } }>(`${root}/bookings/${bookingId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        }),
}
