import type { Paginated } from './base'

// ── Types ──────────────────────────────────────────────────────────────────

export type GuestSupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type GuestSupportTicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type GuestSupportTicketCategory =
    | 'GENERAL'
    | 'BOOKING_ISSUE'
    | 'CHECK_IN_CHECK_OUT'
    | 'CLEANLINESS'
    | 'AMENITIES'
    | 'BILLING'
    | 'MAINTENANCE'
    | 'COMPLAINT'
    | 'SPECIAL_REQUEST'
    | 'OTHER'

export interface GuestSupportTicket {
    id: string
    reference: string
    guestName: string
    guestEmail: string
    guestAvatar: string | null
    propertyName: string
    propertyId: string
    bookingReference: string
    bookingCheckIn: string
    bookingCheckOut: string
    title: string
    description: string
    category: GuestSupportTicketCategory
    priority: GuestSupportTicketPriority
    status: GuestSupportTicketStatus
    assignedToName: string | null
    lastActivityAt: string
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
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_TICKETS: GuestSupportTicket[] = [
    {
        id: 'gs-001',
        reference: 'GS-10001',
        guestName: 'Sarah Mitchell',
        guestEmail: 'sarah.mitchell@email.com',
        guestAvatar: null,
        propertyName: 'Luxury Penthouse Suite',
        propertyId: 'prop-001',
        bookingReference: 'BK-80001',
        bookingCheckIn: '2026-07-20',
        bookingCheckOut: '2026-07-27',
        title: 'Air conditioning not working',
        description: 'The AC in the master bedroom has been making a loud noise and is not cooling properly. It has been like this since yesterday evening.',
        category: 'MAINTENANCE',
        priority: 'HIGH',
        status: 'OPEN',
        assignedToName: null,
        lastActivityAt: '2026-07-22T14:30:00Z',
        createdAt: '2026-07-22T14:30:00Z',
        updatedAt: '2026-07-22T14:30:00Z',
        messageCount: 1,
    },
    {
        id: 'gs-002',
        reference: 'GS-10002',
        guestName: 'James Rodriguez',
        guestEmail: 'james.r@email.com',
        guestAvatar: null,
        propertyName: 'Ocean View Villa',
        propertyId: 'prop-002',
        bookingReference: 'BK-80002',
        bookingCheckIn: '2026-07-18',
        bookingCheckOut: '2026-07-25',
        title: 'Early check-in request',
        description: 'Our flight arrives at 8 AM on July 18. Is it possible to check in early? We are willing to pay an additional fee if needed.',
        category: 'SPECIAL_REQUEST',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        assignedToName: 'Maria Johnson',
        lastActivityAt: '2026-07-21T09:15:00Z',
        createdAt: '2026-07-19T22:00:00Z',
        updatedAt: '2026-07-21T09:15:00Z',
        messageCount: 4,
    },
    {
        id: 'gs-003',
        reference: 'GS-10003',
        guestName: 'Emily Chen',
        guestEmail: 'emily.chen@email.com',
        guestAvatar: null,
        propertyName: 'Downtown Loft',
        propertyId: 'prop-003',
        bookingReference: 'BK-80003',
        bookingCheckIn: '2026-07-15',
        bookingCheckOut: '2026-07-20',
        title: 'WiFi password not working',
        description: 'The WiFi password listed in the welcome packet does not work. We have tried multiple times and keep getting an authentication error.',
        category: 'GENERAL',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        assignedToName: 'David Kim',
        lastActivityAt: '2026-07-16T11:45:00Z',
        createdAt: '2026-07-15T18:30:00Z',
        updatedAt: '2026-07-16T11:45:00Z',
        messageCount: 3,
    },
    {
        id: 'gs-004',
        reference: 'GS-10004',
        guestName: 'Michael Thompson',
        guestEmail: 'm.thompson@email.com',
        guestAvatar: null,
        propertyName: 'Mountain Retreat Cabin',
        propertyId: 'prop-004',
        bookingReference: 'BK-80004',
        bookingCheckIn: '2026-07-10',
        bookingCheckOut: '2026-07-14',
        title: 'Refund for unused night',
        description: 'We had to leave one night early due to a family emergency. Can we get a refund for the night of July 13?',
        category: 'BILLING',
        priority: 'LOW',
        status: 'CLOSED',
        assignedToName: 'Maria Johnson',
        lastActivityAt: '2026-07-14T16:20:00Z',
        createdAt: '2026-07-13T10:00:00Z',
        updatedAt: '2026-07-14T16:20:00Z',
        messageCount: 5,
    },
    {
        id: 'gs-005',
        reference: 'GS-10005',
        guestName: 'Anna Kowalski',
        guestEmail: 'anna.k@email.com',
        guestAvatar: null,
        propertyName: 'Luxury Penthouse Suite',
        propertyId: 'prop-001',
        bookingReference: 'BK-80005',
        bookingCheckIn: '2026-07-23',
        bookingCheckOut: '2026-07-28',
        title: 'Dirty bathroom on arrival',
        description: 'When we arrived, the bathroom was not clean. There were hair in the shower drain and the towels were not fresh. This is unacceptable for a luxury property.',
        category: 'CLEANLINESS',
        priority: 'URGENT',
        status: 'OPEN',
        assignedToName: null,
        lastActivityAt: '2026-07-23T15:45:00Z',
        createdAt: '2026-07-23T15:45:00Z',
        updatedAt: '2026-07-23T15:45:00Z',
        messageCount: 1,
    },
    {
        id: 'gs-006',
        reference: 'GS-10006',
        guestName: 'Robert Wilson',
        guestEmail: 'r.wilson@email.com',
        guestAvatar: null,
        propertyName: 'Ocean View Villa',
        propertyId: 'prop-002',
        bookingReference: 'BK-80006',
        bookingCheckIn: '2026-07-12',
        bookingCheckOut: '2026-07-19',
        title: 'Broken kitchen appliance',
        description: 'The dishwasher stopped working mid-cycle and now there is water pooled at the bottom. Also the toaster seems to have a loose wire.',
        category: 'MAINTENANCE',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedToName: 'David Kim',
        lastActivityAt: '2026-07-17T08:30:00Z',
        createdAt: '2026-07-17T07:00:00Z',
        updatedAt: '2026-07-17T08:30:00Z',
        messageCount: 3,
    },
    {
        id: 'gs-007',
        reference: 'GS-10007',
        guestName: 'Lisa Park',
        guestEmail: 'lisa.park@email.com',
        guestAvatar: null,
        propertyName: 'Downtown Loft',
        propertyId: 'prop-003',
        bookingReference: 'BK-80007',
        bookingCheckIn: '2026-07-24',
        bookingCheckOut: '2026-07-29',
        title: 'Need extra pillows and blankets',
        description: 'We have 2 additional guests staying. Could we get 2 extra pillows and a blanket? The listing says it accommodates 6 but we only found bedding for 4.',
        category: 'SPECIAL_REQUEST',
        priority: 'LOW',
        status: 'OPEN',
        assignedToName: 'Maria Johnson',
        lastActivityAt: '2026-07-24T12:00:00Z',
        createdAt: '2026-07-24T12:00:00Z',
        updatedAt: '2026-07-24T12:00:00Z',
        messageCount: 2,
    },
    {
        id: 'gs-008',
        reference: 'GS-10008',
        guestName: 'Carlos Mendez',
        guestEmail: 'carlos.m@email.com',
        guestAvatar: null,
        propertyName: 'Mountain Retreat Cabin',
        propertyId: 'prop-004',
        bookingReference: 'BK-80008',
        bookingCheckIn: '2026-07-21',
        bookingCheckOut: '2026-07-25',
        title: 'Double charged on booking',
        description: 'I was charged twice for my reservation. My bank statement shows two charges of $450 each on July 20. I need this resolved urgently.',
        category: 'BILLING',
        priority: 'URGENT',
        status: 'OPEN',
        assignedToName: null,
        lastActivityAt: '2026-07-22T09:00:00Z',
        createdAt: '2026-07-22T09:00:00Z',
        updatedAt: '2026-07-22T09:00:00Z',
        messageCount: 2,
    },
    {
        id: 'gs-009',
        reference: 'GS-10009',
        guestName: 'Priya Sharma',
        guestEmail: 'priya.s@email.com',
        guestAvatar: null,
        propertyName: 'Luxury Penthouse Suite',
        propertyId: 'prop-001',
        bookingReference: 'BK-80009',
        bookingCheckIn: '2026-07-05',
        bookingCheckOut: '2026-07-12',
        title: 'Noise complaint from neighboring unit',
        description: 'The guests in the neighboring unit have been playing loud music past midnight every night. Can something be done about this?',
        category: 'COMPLAINT',
        priority: 'MEDIUM',
        status: 'CLOSED',
        assignedToName: 'David Kim',
        lastActivityAt: '2026-07-10T14:00:00Z',
        createdAt: '2026-07-08T23:30:00Z',
        updatedAt: '2026-07-10T14:00:00Z',
        messageCount: 6,
    },
    {
        id: 'gs-010',
        reference: 'GS-10010',
        guestName: 'Tom Bradley',
        guestEmail: 'tom.b@email.com',
        guestAvatar: null,
        propertyName: 'Ocean View Villa',
        propertyId: 'prop-002',
        bookingReference: 'BK-80010',
        bookingCheckIn: '2026-07-25',
        bookingCheckOut: '2026-07-30',
        title: 'Pool area is locked',
        description: 'The pool area gate is locked and there is no key provided. The listing mentions pool access. This is misleading if we cannot use it.',
        category: 'AMENITIES',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedToName: 'Maria Johnson',
        lastActivityAt: '2026-07-25T17:10:00Z',
        createdAt: '2026-07-25T16:00:00Z',
        updatedAt: '2026-07-25T17:10:00Z',
        messageCount: 3,
    },
]

const MOCK_MESSAGES: Record<string, GuestSupportMessage[]> = {
    'gs-001': [
        {
            id: 'msg-001',
            senderUserId: 'guest-001',
            sender: { id: 'guest-001', name: 'Sarah Mitchell', email: 'sarah.mitchell@email.com', image: null },
            message: 'The AC in the master bedroom has been making a loud noise and is not cooling properly. It has been like this since yesterday evening.',
            createdAt: '2026-07-22T14:30:00Z',
        },
    ],
    'gs-002': [
        {
            id: 'msg-002a',
            senderUserId: 'guest-002',
            sender: { id: 'guest-002', name: 'James Rodriguez', email: 'james.r@email.com', image: null },
            message: 'Our flight arrives at 8 AM on July 18. Is it possible to check in early? We are willing to pay an additional fee if needed.',
            createdAt: '2026-07-19T22:00:00Z',
        },
        {
            id: 'msg-002b',
            senderUserId: 'owner-001',
            sender: { id: 'owner-001', name: 'Maria Johnson', email: 'maria.j@company.com', image: null },
            message: 'Hi James! Let me check with our team and get back to you shortly.',
            createdAt: '2026-07-20T08:00:00Z',
        },
        {
            id: 'msg-002c',
            senderUserId: 'owner-001',
            sender: { id: 'owner-001', name: 'Maria Johnson', email: 'maria.j@company.com', image: null },
            message: 'Good news! We can arrange an early check-in at 10 AM for an additional $50. Would you like to proceed?',
            createdAt: '2026-07-20T10:30:00Z',
        },
        {
            id: 'msg-002d',
            senderUserId: 'guest-002',
            sender: { id: 'guest-002', name: 'James Rodriguez', email: 'james.r@email.com', image: null },
            message: 'Yes please, that works perfectly. Thank you!',
            createdAt: '2026-07-21T09:15:00Z',
        },
    ],
    'gs-005': [
        {
            id: 'msg-005a',
            senderUserId: 'guest-005',
            sender: { id: 'guest-005', name: 'Anna Kowalski', email: 'anna.k@email.com', image: null },
            message: 'When we arrived, the bathroom was not clean. There were hair in the shower drain and the towels were not fresh. This is unacceptable for a luxury property.',
            createdAt: '2026-07-23T15:45:00Z',
        },
    ],
    'gs-008': [
        {
            id: 'msg-008a',
            senderUserId: 'guest-008',
            sender: { id: 'guest-008', name: 'Carlos Mendez', email: 'carlos.m@email.com', image: null },
            message: 'I was charged twice for my reservation. My bank statement shows two charges of $450 each on July 20.',
            createdAt: '2026-07-22T09:00:00Z',
        },
        {
            id: 'msg-008b',
            senderUserId: 'guest-008',
            sender: { id: 'guest-008', name: 'Carlos Mendez', email: 'carlos.m@email.com', image: null },
            message: 'Please look into this and refund the duplicate charge as soon as possible.',
            createdAt: '2026-07-22T09:05:00Z',
        },
    ],
}

// ── Helpers ────────────────────────────────────────────────────────────────

function paginate<T>(items: T[], page: number, limit: number): Paginated<T> {
    const start = (page - 1) * limit
    const paged = items.slice(start, start + limit)
    return {
        data: paged,
        meta: { page, limit, total: items.length, totalPages: Math.ceil(items.length / limit) },
    }
}

function filterTickets(tickets: GuestSupportTicket[], params: ListGuestSupportParams): GuestSupportTicket[] {
    let filtered = [...tickets]
    if (params.status) filtered = filtered.filter((t) => t.status === params.status)
    if (params.priority) filtered = filtered.filter((t) => t.priority === params.priority)
    if (params.category) filtered = filtered.filter((t) => t.category === params.category)
    if (params.search) {
        const q = params.search.toLowerCase()
        filtered = filtered.filter(
            (t) =>
                t.title.toLowerCase().includes(q) ||
                t.reference.toLowerCase().includes(q) ||
                t.guestName.toLowerCase().includes(q) ||
                t.propertyName.toLowerCase().includes(q) ||
                t.bookingReference.toLowerCase().includes(q),
        )
    }
    return filtered
}

// ── API ────────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const guestSupportApi = {
    listTickets: async (params?: ListGuestSupportParams): Promise<Paginated<GuestSupportTicket>> => {
        await delay(300)
        const filtered = filterTickets(MOCK_TICKETS, params ?? {})
        const page = params?.page ?? 1
        const limit = params?.limit ?? 10
        return paginate(filtered, page, limit)
    },

    getTicket: async (id: string): Promise<{ data: GuestSupportTicket }> => {
        await delay(200)
        const ticket = MOCK_TICKETS.find((t) => t.id === id)
        if (!ticket) throw new Error('Ticket not found')
        return { data: ticket }
    },

    listMessages: async (ticketId: string, params?: { cursor?: string; limit?: number }): Promise<GuestSupportMessagePage> => {
        await delay(200)
        const messages = MOCK_MESSAGES[ticketId] ?? []
        const limit = params?.limit ?? 20
        const cursorIndex = params?.cursor ? messages.findIndex((m) => m.id === params.cursor) : messages.length
        const end = cursorIndex === -1 ? messages.length : cursorIndex
        const start = Math.max(0, end - limit)
        const sliced = messages.slice(start, end)
        return {
            data: sliced,
            meta: {
                hasMore: start > 0,
                nextCursor: start > 0 ? (messages[start - 1]?.id ?? null) : null,
            },
        }
    },

    sendMessage: async (ticketId: string, payload: { message: string }): Promise<{ data: GuestSupportMessage }> => {
        await delay(300)
        const newMsg: GuestSupportMessage = {
            id: `msg-${Date.now()}`,
            senderUserId: 'owner-current',
            sender: { id: 'owner-current', name: 'You', email: 'owner@company.com', image: null },
            message: payload.message,
            createdAt: new Date().toISOString(),
        }
        if (!MOCK_MESSAGES[ticketId]) MOCK_MESSAGES[ticketId] = []
        MOCK_MESSAGES[ticketId].push(newMsg)
        return { data: newMsg }
    },
}
