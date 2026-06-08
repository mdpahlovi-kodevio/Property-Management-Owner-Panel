export type Reservation = {
    id: number
    userEmail: string
    property: string
    unit: string
    checkIn: string
    checkOut: string
    payment: string
    paymentMethod: string
    image?: string
    status: 'Pending' | 'Confirmed' | 'Cancelled'
}

export let RESERVATIONS: Reservation[] = [
    {
        id: 1,
        userEmail: 'jane.cooper@example.com',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jane',
        property: 'prop_001',
        unit: 'unit_001_01_01',
        checkIn: '2026-06-01',
        checkOut: '2026-06-05',
        payment: '$480.00 (Paid)',
        paymentMethod: 'Credit Card',
        status: 'Confirmed',
    },
    {
        id: 2,
        userEmail: 'wade.warren@example.com',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Wade',
        property: 'prop_002',
        unit: 'unit_002_01_01',
        checkIn: '2026-06-10',
        checkOut: '2026-06-12',
        payment: '$220.00 (Pending)',
        paymentMethod: 'PayPal',
        status: 'Confirmed',
    },
    {
        id: 3,
        userEmail: 'dianne.russell@example.com',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Dianne',
        property: 'prop_003',
        unit: 'unit_003_01_01',
        checkIn: '2026-07-02',
        checkOut: '2026-07-06',
        payment: '$640.00 (Paid)',
        paymentMethod: 'Credit Card',
        status: 'Cancelled',
    },
    {
        id: 4,
        userEmail: 'eleanor.pena@example.com',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Eleanor',
        property: 'prop_004',
        unit: 'unit_004_01_01',
        checkIn: '2026-08-15',
        checkOut: '2026-08-17',
        payment: '$180.00 (Paid)',
        paymentMethod: 'Cash',
        status: 'Confirmed',
    },
]

export function getReservationById(id: number): Reservation | undefined {
    return RESERVATIONS.find((r) => r.id === id)
}

export function createReservation(data: Omit<Reservation, 'id'>): Reservation {
    const newReservation = { id: Date.now(), ...data }
    RESERVATIONS = [...RESERVATIONS, newReservation]
    return newReservation
}

export function updateReservation(id: number, data: Partial<Reservation>): Reservation | undefined {
    const index = RESERVATIONS.findIndex((r) => r.id === id)
    if (index !== -1) {
        RESERVATIONS[index] = { ...RESERVATIONS[index], ...data }
        return RESERVATIONS[index]
    }
    return undefined
}

export function toggleReservationStatus(id: number): Reservation | undefined {
    const index = RESERVATIONS.findIndex((r) => r.id === id)
    if (index !== -1) {
        const r = RESERVATIONS[index]
        const nextStatus = r.status === 'Pending' ? 'Confirmed' : r.status === 'Confirmed' ? 'Cancelled' : 'Pending'
        RESERVATIONS[index] = { ...r, status: nextStatus }
        return RESERVATIONS[index]
    }
    return undefined
}

export function deleteReservation(id: number): boolean {
    const initialLength = RESERVATIONS.length
    RESERVATIONS = RESERVATIONS.filter((r) => r.id !== id)
    return RESERVATIONS.length !== initialLength
}
