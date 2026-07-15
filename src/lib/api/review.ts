import type { Paginated } from './base'
import { request, toQuery } from './base'

export interface ReviewBooking {
    id: string
    checkInDate: string
    checkOutDate: string
    property: { id: string; name: string; slug: string; currency: string }
}

export interface ReviewGuest {
    id: string
    user: { id: string; name: string; email: string; image: string | null }
}

export interface Review {
    id: string
    bookingId: string
    propertyId: string
    guestId: string
    rating: number
    title: string | null
    comment: string
    isPublic: boolean
    createdAt: string
    updatedAt: string
    booking: ReviewBooking
    property: { id: string; name: string; slug: string }
    guest: ReviewGuest
}

export interface ReviewDistribution {
    1: number
    2: number
    3: number
    4: number
    5: number
}

export interface ReviewStats {
    totalReviews: number
    averageRating: number
    distribution: ReviewDistribution
    totalProperties: number
}

export interface ListReviewParams {
    page?: number
    limit?: number
    propertyId?: string
    rating?: number
    search?: string
}

export const reviewApi = {
    list: (params?: ListReviewParams) =>
        request<Paginated<Review>>(`/owner/review${toQuery((params ?? {}) as Record<string, string | number | boolean | undefined>)}`),

    stats: (params?: { propertyId?: string }) =>
        request<{ data: ReviewStats }>(
            `/owner/review/stats${toQuery((params ?? {}) as Record<string, string | number | boolean | undefined>)}`,
        ),

    setVisibility: (id: string, isPublic: boolean) =>
        request<{ data: Review }>(`/owner/review/${id}/visibility`, {
            method: 'PATCH',
            body: JSON.stringify({ isPublic }),
        }),

    remove: (id: string) =>
        request<void>(`/owner/review/${id}`, {
            method: 'DELETE',
        }),
}
