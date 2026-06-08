export type RoomMetrics = {
    occupancy: number
    revenue: number
    trendOccupancy: string
    trendRevenue: string
}

export type UnitStatus = 'Clean' | 'Occupied' | 'Dirty' | 'Maintenance'

export function getRoomMetrics(roomId: string, basePrice: number): RoomMetrics {
    // Deterministic simulation based on roomId string to keep UI stable
    const seed = roomId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const occupancy = Math.floor((seed % 40) + 40)
    const revenue = (basePrice * occupancy * 30) / 100 * (((seed % 50) / 100) + 0.8)

    return {
        occupancy,
        revenue,
        trendOccupancy: "+5.2%",
        trendRevenue: "+12.1%",
    }
}

export function getUnitStatus(unitId: string): UnitStatus {
    const statuses: UnitStatus[] = ['Clean', 'Occupied', 'Dirty', 'Maintenance']
    const seed = unitId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return statuses[seed % statuses.length]
}

export const UNIT_STATUS_COLORS: Record<UnitStatus, string> = {
    'Clean': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Occupied': 'bg-blue-100 text-blue-700 border-blue-200',
    'Dirty': 'bg-amber-100 text-amber-700 border-amber-200',
    'Maintenance': 'bg-rose-100 text-rose-700 border-rose-200',
}
