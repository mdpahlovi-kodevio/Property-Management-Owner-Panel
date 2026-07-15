import type { Paginated } from './base'
import { request, toQuery } from './base'
import type { BookingSource, PaymentMethod, PaymentStatus } from './booking'

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

export interface CreatePaymentPayload {
    bookingId: string
    amount: string
    method: PaymentMethod
    status?: PaymentStatus
    provider?: string
    providerRef?: string
    note?: string
    settledAt?: string
}

export interface UpdatePaymentPayload {
    bookingId: string
    status?: PaymentStatus
    provider?: string
    providerRef?: string
    note?: string
    reason?: string
}

export const paymentApi = {
    list: (params?: ListPaymentParams) =>
        request<Paginated<Payment>>(`/owner/payment${toQuery((params ?? {}) as Record<string, string | number | boolean | undefined>)}`),

    create: (payload: CreatePaymentPayload) =>
        request<{ data: Payment }>(`/owner/payment`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    update: (paymentId: string, payload: UpdatePaymentPayload) =>
        request<{ data: Payment }>(`/owner/payment/${paymentId}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }),
}
