export type Review = {
    id: string
    guestName: string
    property: string
    date: string
    rating: number
    platform: 'Airbnb' | 'Booking.com' | 'Direct' | 'Expedia'
    text: string
    avatarUrl: string
    status?: string
    replyText?: string
}

export let REVIEWS: Review[] = [
    {
        id: 'REV-001',
        guestName: 'Eleanor Pena',
        property: 'Sunset Paradise Resort',
        date: 'Oct 24, 2026',
        rating: 5,
        platform: 'Airbnb',
        text: 'Absolutely wonderful stay! The view from the balcony was breathtaking and the staff was incredibly accommodating. We loved the welcome basket and the seamless check-in process.',
        avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Eleanor&backgroundColor=f1f5f9',
    },
    {
        id: 'REV-002',
        guestName: 'Guy Hawkins',
        property: 'Ocean Breeze Villa',
        date: 'Oct 22, 2026',
        rating: 4,
        platform: 'Booking.com',
        text: 'Great location and very clean. The Wi-Fi was a bit spotty in the evenings, but otherwise a fantastic experience. Would recommend to friends visiting the area.',
        avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Guy&backgroundColor=f1f5f9',
    },
    {
        id: 'REV-003',
        guestName: 'Jenny Wilson',
        property: 'Coral Bay Residence',
        date: 'Oct 20, 2026',
        rating: 5,
        platform: 'Direct',
        text: 'The best vacation rental we have ever booked. Everything was spotless, the kitchen was fully equipped, and the host responded within minutes to our queries.',
        avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jenny&backgroundColor=f1f5f9',
    },
    {
        id: 'REV-004',
        guestName: 'Robert Fox',
        property: 'Palm Horizon Retreat',
        date: 'Oct 18, 2026',
        rating: 3,
        platform: 'Expedia',
        text: 'The property was okay, but the air conditioning in the master bedroom was noisy. Also, the pool was smaller than it looked in the photos.',
        avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Robert&backgroundColor=f1f5f9',
    },
    {
        id: 'REV-005',
        guestName: 'Esther Howard',
        property: 'Sunset Paradise Resort',
        date: 'Oct 15, 2026',
        rating: 5,
        platform: 'Airbnb',
        text: 'A hidden gem! Watching the sunset from the private deck is a memory I will cherish forever. Worth every penny.',
        avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Esther&backgroundColor=f1f5f9',
    },
]

export function replyToReview(id: string, text: string): Review | undefined {
    const index = REVIEWS.findIndex(r => r.id === id)
    if (index !== -1) {
        REVIEWS[index] = { ...REVIEWS[index], status: 'Replied', replyText: text }
        return REVIEWS[index]
    }
    return undefined
}

export function deleteReview(id: string): boolean {
    const initialLength = REVIEWS.length
    REVIEWS = REVIEWS.filter(r => r.id !== id)
    return REVIEWS.length !== initialLength
}
