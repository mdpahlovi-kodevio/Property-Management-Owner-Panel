import { request, toQuery } from './base'

export interface Amenity {
    id: string
    key: string
    name: string
    category: string | null
    icon: string | null
}

export interface ListAmenityParams {
    category?: string
}

export const amenitiesApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        request<{ data: Amenity[] }>(`/owner/amenities${toQuery(params ?? {})}`),
}
