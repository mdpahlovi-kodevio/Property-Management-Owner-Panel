import type { BookingSource } from './booking'
import { request, toQuery } from './base'
import type { ArrivalRow, ReportsFilterParams } from './reports'

export type TrendGranularity = 'daily' | 'weekly'

export interface AnalyticsMetrics {
    grossBookingValue: number
    confirmedBookings: number
    occupancyRate: number
    adr: number
    revpar: number
    availableRooms: number
    totalRoomNights: number
}

export interface TrendPoint {
    date: string
    label: string
    revenue: number
    bookings: number
}

export interface ChannelRow {
    source: BookingSource
    bookings: number
    revenue: number
}

export interface PeakDay {
    date: string
    occupied: number
}

export interface OverviewReport {
    metrics: AnalyticsMetrics
    trend: TrendPoint[]
    channels: ChannelRow[]
    peak: PeakDay | null
    low: PeakDay | null
}

export interface HeatmapRow {
    date: string
    occupied: number
    availableRooms: number
    occupancyRate: number
}

export interface AddonRevenueRow {
    name: string
    revenue: number
}

export interface OperationsReport {
    arrivals: ArrivalRow[]
    summary: {
        arrivalsToday: number
        departuresToday: number
        inHouse: number
        noShows: number
    }
    heatmap: HeatmapRow[]
    addons: AddonRevenueRow[]
}

export interface AnalyticsFilterParams extends ReportsFilterParams {
    granularity?: TrendGranularity
}

export const analyticsApi = {
    overview: (params?: AnalyticsFilterParams) =>
        request<OverviewReport>(
            `/owner/analytics/overview${toQuery((params ?? {}) as Record<string, string | number | boolean | undefined>)}`,
        ),

    operations: (params?: ReportsFilterParams) =>
        request<OperationsReport>(
            `/owner/analytics/operations${toQuery((params ?? {}) as Record<string, string | number | boolean | undefined>)}`,
        ),
}
