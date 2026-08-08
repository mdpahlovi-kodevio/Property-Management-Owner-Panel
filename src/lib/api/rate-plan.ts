import type { Paginated } from './base'
import { request, toQuery } from './base'

// ── Enums ───────────────
export const RatePlanStatusOptions = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const
export type RatePlanStatus = (typeof RatePlanStatusOptions)[number]

// ── Shapes ──────────────────────────────────────────────
export interface RatePlanDaily {
    ratePlanId: string
    date: string
    price: string | number
    minLOS: number | null
    maxLOS: number | null
    closedToArrival: boolean
    closedToDeparture: boolean
    stopSell: boolean
    updatedAt: string
}

export interface RatePlan {
    id: string
    propertyId: string
    roomTypeId: string
    name: string
    code: string
    description: string | null
    status: RatePlanStatus
    defaultPrice: string | number
    defaultMinLOS: number | null
    defaultMaxLOS: number | null
    defaultClosedToArrival: boolean
    defaultClosedToDeparture: boolean
    createdAt: string
    updatedAt: string
    daily: RatePlanDaily[]
}

export interface RatePlanListItem {
    id: string
    propertyId: string
    roomTypeId: string
    name: string
    code: string
    description: string | null
    status: RatePlanStatus
    defaultPrice: string | number
    defaultMinLOS: number | null
    defaultMaxLOS: number | null
    defaultClosedToArrival: boolean
    defaultClosedToDeparture: boolean
    createdAt: string
    updatedAt: string
    roomType: { id: string; name: string; internalCode: string }
    _count: { daily: number }
}

// ── Query / payload types ───────────────────────────────
export interface ListRatePlanParams {
    page?: number
    limit?: number
    search?: string
    propertyId?: string
    roomTypeId?: string
    status?: RatePlanStatus
}

export interface CreateRatePlanPayload {
    propertyId: string
    roomTypeId: string
    name: string
    code: string
    description?: string
    status?: RatePlanStatus
    defaultPrice: number
    defaultMinLOS?: number
    defaultMaxLOS?: number
    defaultClosedToArrival?: boolean
    defaultClosedToDeparture?: boolean
}

export type UpdateRatePlanPayload = Partial<CreateRatePlanPayload>

export interface FillDailyRatePlanPayload {
    ratePlanId: string
    fromDate: string
    toDate: string
    price?: number
    minLOS?: number
    maxLOS?: number
    closedToArrival?: boolean
    closedToDeparture?: boolean
    stopSell?: boolean
    /** 0 = Sunday … 6 = Saturday; omit to fill every day in the range. */
    weekdays?: number[]
}

/** One calendar day with effective values (daily override or plan defaults). */
export interface RatePlanCalendarDay {
    date: string
    price: string | number
    source: 'daily' | 'default'
    minLOS: number | null
    maxLOS: number | null
    closedToArrival: boolean
    closedToDeparture: boolean
    stopSell: boolean
}

export interface ListDailyRatePlanParams {
    ratePlanId: string
    fromDate: string
    toDate: string
}

// ── Helpers ─────────────────────────────────────────────
export function parseRatePlanPrice(price: string | number | null | undefined): number {
    if (price == null) return 0
    const num = typeof price === 'string' ? Number(price) : price
    return Number.isFinite(num) ? num : 0
}

// ── API ─────────────────────────────────────────────────
export const ratePlanApi = {
    list: (params?: ListRatePlanParams) =>
        request<Paginated<RatePlanListItem>>(
            `/owner/rate-plan${toQuery((params ?? {}) as Record<string, string | number | boolean | undefined>)}`,
        ),

    get: (id: string) => request<{ data: RatePlan }>(`/owner/rate-plan/${id}`),

    create: (payload: CreateRatePlanPayload) =>
        request<{ data: RatePlan }>(`/owner/rate-plan`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    update: (id: string, payload: UpdateRatePlanPayload) =>
        request<{ data: RatePlan }>(`/owner/rate-plan/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }),

    remove: (id: string) =>
        request<{ data: { id: string } }>(`/owner/rate-plan/${id}`, {
            method: 'DELETE',
        }),

    fillDaily: (payload: FillDailyRatePlanPayload) =>
        request<{ data: { ratePlanId: string; fromDate: string; toDate: string; days: number } }>(`/owner/rate-plan/daily/fill`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    listDaily: (params: ListDailyRatePlanParams) =>
        request<{ data: RatePlanDaily[] }>(
            `/owner/rate-plan/daily/list${toQuery(params as unknown as Record<string, string | number | boolean | undefined>)}`,
        ),

    calendar: (params: ListDailyRatePlanParams) =>
        request<{ data: { ratePlanId: string; days: RatePlanCalendarDay[] } }>(
            `/owner/rate-plan/daily/calendar${toQuery(params as unknown as Record<string, string | number | boolean | undefined>)}`,
        ),
}
