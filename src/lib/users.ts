export type User = {
    id: number
    name: string
    image: string
    phone: string
    email: string
    bookings: number
    status: 'Active' | 'Blocked'
}

export let USERS: User[] = [
    { id: 1, name: 'Jane Cooper', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jane', phone: '+1 416 XXX XXXX', email: 'janecoper@gmail.com', bookings: 4, status: 'Active' },
    { id: 2, name: 'Wade Warren', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Wade', phone: '+1 416 XXX XXXX', email: 'weaver@example.com', bookings: 5, status: 'Active' },
    { id: 3, name: 'Esther Howard', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Esther', phone: '+1 416 XXX XXXX', email: 'esther@gmail.com', bookings: 3, status: 'Active' },
    { id: 4, name: 'Leslie Alexander', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Leslie', phone: '+1 416 XXX XXXX', email: 'leslie@gmail.com', bookings: 7, status: 'Active' },
    { id: 5, name: 'Jenny Wilson', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jenny', phone: '+1 416 XXX XXXX', email: 'janecoper@gmail.com', bookings: 3, status: 'Active' },
    { id: 6, name: 'Guy Hawkins', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Guy', phone: '+1 416 XXX XXXX', email: 'hawkins@gmail.com', bookings: 2, status: 'Active' },
    { id: 7, name: 'Robert Fox', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Robert', phone: '+1 416 XXX XXXX', email: 'robert@gmail.com', bookings: 4, status: 'Active' },
    { id: 8, name: 'Kristin Watson', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Kristin', phone: '+1 416 XXX XXXX', email: 'kristin@gmail.com', bookings: 2, status: 'Blocked' },
    { id: 9, name: 'Jacob Jones', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jacob', phone: '+1 416 XXX XXXX', email: 'jacob@gmail.com', bookings: 4, status: 'Active' },
    { id: 10, name: 'Bessie Cooper', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Bessie', phone: '+1 416 XXX XXXX', email: 'bessie@gmail.com', bookings: 2, status: 'Active' },
    { id: 11, name: 'Albert Flores', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Albert', phone: '+1 416 XXX XXXX', email: 'albert@gmail.com', bookings: 2, status: 'Active' },
    { id: 12, name: 'Dianne Russell', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Dianne', phone: '+1 416 XXX XXXX', email: 'dianne@gmail.com', bookings: 3, status: 'Blocked' },
    { id: 13, name: 'Eleanor Pena', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Eleanor', phone: '+1 416 XXX XXXX', email: 'eleanor@gmail.com', bookings: 4, status: 'Blocked' },
]

export function getUserById(id: number): User | undefined {
    return USERS.find((u) => u.id === id)
}

export function createUser(data: Omit<User, 'id'>): User {
    const newUser = { id: Date.now(), ...data }
    USERS = [...USERS, newUser]
    return newUser
}

export function updateUser(id: number, data: Partial<User>): User | undefined {
    const index = USERS.findIndex((u) => u.id === id)
    if (index !== -1) {
        USERS[index] = { ...USERS[index], ...data }
        return USERS[index]
    }
    return undefined
}

export function toggleUserStatus(id: number): User | undefined {
    const index = USERS.findIndex((u) => u.id === id)
    if (index !== -1) {
        USERS[index] = { 
            ...USERS[index], 
            status: USERS[index].status === 'Active' ? 'Blocked' : 'Active' 
        }
        return USERS[index]
    }
    return undefined
}

export function deleteUser(id: number): boolean {
    const initialLength = USERS.length
    USERS = USERS.filter((u) => u.id !== id)
    return USERS.length !== initialLength
}
