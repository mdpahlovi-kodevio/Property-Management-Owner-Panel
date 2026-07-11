import { amenitiesApi, guestApi, propertyApi, roomTypeApi, websiteBuilderApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function capitalize(word: string): string {
    return word
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export function GetWebsites() {
    const { data } = useQuery({
        queryKey: ['websites-page-less'],
        queryFn: () =>
            websiteBuilderApi.listPageLess().catch((error) => {
                console.error(error)
                return null
            }),
    })

    if (!data || !data.data) {
        return []
    }

    return data.data
}

export function GetProperties() {
    const { data } = useQuery({
        queryKey: ['properties-page-less'],
        queryFn: () => propertyApi.listPageLess().catch(() => null),
    })

    if (!data || !data.data) {
        return []
    }

    return data.data
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

export function GetRoomTypes() {
    const { data } = useQuery({
        queryKey: ['room-types'],
        queryFn: () => roomTypeApi.listPageLess().catch(() => null),
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

export function GetGuests() {
    const { data } = useQuery({
        queryKey: ['guests-page-less'],
        queryFn: () => guestApi.listPageLess().catch(() => null),
    })

    if (!data || !data.data) {
        return []
    }

    return data.data
}
