import { request, toQuery } from './base'
import type { BookingSource, BookingStatus } from './booking'

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface ReportsFilterParams {
    from?: string
    to?: string
    propertyId?: string
}

export interface OccupancyRow {
    date: string
    availableRooms: number
    occupied: number
    occupancyRate: number
    adr: number
    revpar: number
    revenue: number
}

export interface OccupancyReport {
    data: OccupancyRow[]
    summary: {
        occupancyRate: number
        adr: number
        revpar: number
        totalRoomNights: number
    }
}

export interface RevenueSourceRow {
    source: BookingSource
    bookings: number
    totalRevenue: number
    totalEarnings: number
    expectedPayout: number
}

export interface RevenueReport {
    data: RevenueSourceRow[]
    summary: {
        totalRevenue: number
        totalBookings: number
        netEarnings: number
        topChannel: BookingSource | null
    }
}

export interface ArrivalRow {
    bookingId: string
    bookingRef: string
    guest: string
    propertyUnit: string
    checkIn: string
    checkOut: string
    nights: number
    source: BookingSource
    status: BookingStatus
}

export interface ArrivalsReport {
    data: ArrivalRow[]
    summary: {
        arrivalsToday: number
        departuresToday: number
        inHouse: number
        noShows: number
    }
}

export interface SourceReportRow {
    date: string
    label: string
    totalBookings: number
    totalRevenue: number
    totalEarnings: number
    expectedPayout: number
}

export interface SourceReportParams extends ReportsFilterParams {
    period?: ReportPeriod
}

export const reportsApi = {
    occupancy: (params?: ReportsFilterParams) =>
        request<OccupancyReport>(`/owner/reports/occupancy${toQuery((params ?? {}) as Record<string, string | number | boolean | undefined>)}`),

    revenue: (params?: ReportsFilterParams) =>
        request<RevenueReport>(`/owner/reports/revenue${toQuery((params ?? {}) as Record<string, string | number | boolean | undefined>)}`),

    arrivals: (params?: ReportsFilterParams) =>
        request<ArrivalsReport>(`/owner/reports/arrivals${toQuery((params ?? {}) as Record<string, string | number | boolean | undefined>)}`),

    source: (source: string, params?: SourceReportParams) =>
        request<{ data: SourceReportRow[] }>(`/owner/reports/source/${source}${toQuery((params ?? {}) as Record<string, string | number | boolean | undefined>)}`),
}
