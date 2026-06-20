import { amenitiesApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function GetPropertyAmenities() {
    const { data } = useQuery({
        queryKey: ['amenities', { category: 'property' }],
        queryFn: () => amenitiesApi.list({ category: 'property' }).catch(() => null),
    })

    if (!data || !data.data) {
        return []
    }

    return data.data
}

export function GetRoomAmenities() {
    const { data } = useQuery({
        queryKey: ['amenities', { category: 'room' }],
        queryFn: () => amenitiesApi.list({ category: 'room' }).catch(() => null),
    })

    if (!data || !data.data) {
        return []
    }

    return data.data
}
