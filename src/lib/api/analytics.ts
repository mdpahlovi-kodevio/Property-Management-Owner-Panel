import { request, toQuery } from './base'
import type { ArrivalRow, ReportsFilterParams } from './reports'

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

export const analyticsApi = {
    operations: (params?: ReportsFilterParams) =>
        request<OperationsReport>(
            `/owner/analytics/operations${toQuery((params ?? {}) as Record<string, string | number | boolean | undefined>)}`,
        ),
}
