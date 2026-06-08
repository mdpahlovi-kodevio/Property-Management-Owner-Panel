export type Employee = {
    id: number
    name: string
    image: string
    email: string
    phone: string
    role: string
    status: 'Active' | 'Blocked'
}

export let EMPLOYEES: Employee[] = [
    {
        id: 1,
        name: 'Jane Cooper',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jane',
        email: 'john.smith@email.com',
        phone: '+1 647-210-4587',
        role: 'Manager',
        status: 'Active',
    },
    {
        id: 2,
        name: 'Wade Warren',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Wade',
        email: 'sarah.j@email.com',
        phone: '+1 647-210-4587',
        role: 'Super Admin',
        status: 'Active',
    },
    {
        id: 3,
        name: 'Dianne Russell',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Dianne',
        email: 'ava.w@email.com',
        phone: '+1 647-210-4587',
        role: 'Maintenance Staff',
        status: 'Active',
    },
    {
        id: 4,
        name: 'Eleanor Pena',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Eleanor',
        email: 'william.h@email.com',
        phone: '+1 647-210-4587',
        role: 'Accountant',
        status: 'Active',
    },
    {
        id: 5,
        name: 'Courtney Henry',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Courtney',
        email: 'courtney.h@email.com',
        phone: '+1 647-210-4588',
        role: 'Customer Support',
        status: 'Active',
    },
    {
        id: 6,
        name: 'Albert Flores',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Albert',
        email: 'albert.f@email.com',
        phone: '+1 647-210-4589',
        role: 'Property Inspector',
        status: 'Active',
    },
    {
        id: 7,
        name: 'Kathryn Murphy',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Kathryn',
        email: 'kathryn.m@email.com',
        phone: '+1 647-210-4590',
        role: 'Marketing Specialist',
        status: 'Blocked',
    },
    {
        id: 8,
        name: 'Cody Fisher',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Cody',
        email: 'cody.f@email.com',
        phone: '+1 647-210-4591',
        role: 'IT Administrator',
        status: 'Active',
    },
    {
        id: 9,
        name: 'Savannah Nguyen',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Savannah',
        email: 'savannah.n@email.com',
        phone: '+1 647-210-4592',
        role: 'Sales Representative',
        status: 'Active',
    },
    {
        id: 10,
        name: 'Ralph Edwards',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Ralph',
        email: 'ralph.e@email.com',
        phone: '+1 647-210-4593',
        role: 'HR Manager',
        status: 'Blocked',
    },
    {
        id: 11,
        name: 'Bessie Cooper',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Bessie',
        email: 'bessie.c@email.com',
        phone: '+1 647-210-4594',
        role: 'Legal Advisor',
        status: 'Active',
    },
    {
        id: 12,
        name: 'Jerome Bell',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jerome',
        email: 'jerome.b@email.com',
        phone: '+1 647-210-4595',
        role: 'Data Analyst',
        status: 'Active',
    },
]

export function getEmployeeById(id: number): Employee | undefined {
    return EMPLOYEES.find((e) => e.id === id)
}

export function createEmployee(data: Omit<Employee, 'id'>): Employee {
    const newEmployee = { id: Date.now(), ...data }
    EMPLOYEES = [...EMPLOYEES, newEmployee]
    return newEmployee
}

export function updateEmployee(id: number, data: Partial<Employee>): Employee | undefined {
    const index = EMPLOYEES.findIndex((e) => e.id === id)
    if (index !== -1) {
        EMPLOYEES[index] = { ...EMPLOYEES[index], ...data }
        return EMPLOYEES[index]
    }
    return undefined
}

export function toggleEmployeeStatus(id: number): Employee | undefined {
    const index = EMPLOYEES.findIndex((e) => e.id === id)
    if (index !== -1) {
        const e = EMPLOYEES[index]
        const nextStatus = e.status === 'Active' ? 'Blocked' : 'Active'
        EMPLOYEES[index] = { ...e, status: nextStatus }
        return EMPLOYEES[index]
    }
    return undefined
}

export function deleteEmployee(id: number): boolean {
    const initialLength = EMPLOYEES.length
    EMPLOYEES = EMPLOYEES.filter((e) => e.id !== id)
    return EMPLOYEES.length !== initialLength
}
