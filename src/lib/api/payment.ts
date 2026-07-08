import type { Paginated } from './base'
import { request, toQuery } from './base'

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK'

export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED'

export type BookingSource = 'DIRECT' | 'MANUAL' | 'OTA' | 'API'

export interface PaymentBookingSummary {
    id: string
    property: { id: string; name: string; slug: string }
    roomType: { id: string; name: string }
    unit: { id: string; roomNumber: string }
    guest: { user: { id: string; name: string; email: string } }
    source: BookingSource
    status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW'
    currency: string
    grandTotal: string
    amountPaid: string
    amountRefunded: string
}

export interface Payment {
    id: string
    bookingId: string
    amount: string
    currency: string
    method: PaymentMethod
    status: PaymentStatus
    provider: string | null
    providerRef: string | null
    paidAt: string | null
    refundedAt: string | null
    failedAt: string | null
    note: string | null
    createdAt: string
    updatedAt: string
    booking: PaymentBookingSummary
    createdBy: { id: string; name: string } | null
}

export interface ListPaymentParams {
    page?: number
    limit?: number
    status?: PaymentStatus
    method?: PaymentMethod
    bookingId?: string
    search?: string
}

export const paymentApi = {
    list: (params?: ListPaymentParams) =>
        request<Paginated<Payment>>(`/owner/payment${toQuery((params ?? {}) as Record<string, string | number | boolean | undefined>)}`),
}
