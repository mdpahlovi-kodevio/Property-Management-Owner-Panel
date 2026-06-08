export type RoleItem = {
    id: number
    roleName: string
    employees: string
    modules: { moduleName: string; enabled: boolean; permissions?: string[] }[]
}

export const INITIAL_ROLES: RoleItem[] = [
    {
        id: 1,
        roleName: 'Manager',
        employees: 'Jane Cooper',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards', 'Revenue Overview'] },
            { moduleName: 'Users', enabled: true, permissions: ['Create', 'View'] },
            { moduleName: 'Properties', enabled: true, permissions: ['Create', 'Update', 'View'] },
            { moduleName: 'Reports', enabled: true, permissions: ['View', 'Export'] },
            { moduleName: 'Support', enabled: true, permissions: ['Create', 'Update', 'View'] },
            { moduleName: 'Settings', enabled: true, permissions: ['Create', 'Update', 'View'] },
        ],
    },
    {
        id: 2,
        roleName: 'Super Admin',
        employees: 'Wade Warren',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards', 'Revenue Overview'] },
            { moduleName: 'Users', enabled: true, permissions: ['Create', 'Update', 'View'] },
            { moduleName: 'Property Owners', enabled: true, permissions: ['Create', 'Update', 'View'] },
            { moduleName: 'Properties', enabled: true, permissions: ['Create', 'Update', 'View'] },
            { moduleName: 'Reservations', enabled: true, permissions: ['Create', 'Update', 'View'] },
        ],
    },
    {
        id: 3,
        roleName: 'Maintenance Staff',
        employees: 'Dianne Russell',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards'] },
            { moduleName: 'Users', enabled: true, permissions: ['View'] },
            { moduleName: 'Properties', enabled: true, permissions: ['Create', 'Update', 'View'] },
        ],
    },
    {
        id: 4,
        roleName: 'Accountant',
        employees: 'Eleanor Pena',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards', 'Revenue Overview'] },
            { moduleName: 'Employee', enabled: true, permissions: ['View'] },
            { moduleName: 'Reports', enabled: true, permissions: ['View', 'Export'] },
            { moduleName: 'Support', enabled: true, permissions: ['Create', 'Update', 'View'] },
            { moduleName: 'Settings', enabled: true, permissions: ['Create', 'Update', 'View'] },
        ],
    },
    {
        id: 5,
        roleName: 'Customer Support',
        employees: 'Courtney Henry',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards'] },
            { moduleName: 'Users', enabled: true, permissions: ['View'] },
            { moduleName: 'Support', enabled: true, permissions: ['Create', 'Update', 'View', 'Resolve'] },
        ],
    },
    {
        id: 6,
        roleName: 'Property Inspector',
        employees: 'Albert Flores',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards'] },
            { moduleName: 'Properties', enabled: true, permissions: ['View'] },
            { moduleName: 'Reports', enabled: true, permissions: ['Create', 'Update', 'View'] },
        ],
    },
    {
        id: 7,
        roleName: 'Marketing Specialist',
        employees: 'Kathryn Murphy',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards', 'Revenue Overview'] },
            { moduleName: 'Properties', enabled: true, permissions: ['View'] },
            { moduleName: 'Reports', enabled: true, permissions: ['Create', 'View', 'Export'] },
        ],
    },
    {
        id: 8,
        roleName: 'IT Administrator',
        employees: 'Cody Fisher',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards'] },
            { moduleName: 'Users', enabled: true, permissions: ['Create', 'Update', 'View', 'Delete'] },
            { moduleName: 'Employee', enabled: true, permissions: ['Create', 'Update', 'View', 'Delete'] },
            { moduleName: 'Settings', enabled: true, permissions: ['Create', 'Update', 'View', 'Delete'] },
        ],
    },
    {
        id: 9,
        roleName: 'Sales Representative',
        employees: 'Savannah Nguyen',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards', 'Revenue Overview'] },
            { moduleName: 'Property Owners', enabled: true, permissions: ['Create', 'View'] },
            { moduleName: 'Properties', enabled: true, permissions: ['View'] },
        ],
    },
    {
        id: 10,
        roleName: 'HR Manager',
        employees: 'Ralph Edwards',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards'] },
            { moduleName: 'Users', enabled: true, permissions: ['Create', 'Update', 'View', 'Delete'] },
            { moduleName: 'Employee', enabled: true, permissions: ['Create', 'Update', 'View', 'Delete'] },
        ],
    },
    {
        id: 11,
        roleName: 'Legal Advisor',
        employees: 'Bessie Cooper',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards'] },
            { moduleName: 'Properties', enabled: true, permissions: ['View'] },
            { moduleName: 'Reports', enabled: true, permissions: ['View', 'Export'] },
        ],
    },
    {
        id: 12,
        roleName: 'Data Analyst',
        employees: 'Jerome Bell',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards', 'Revenue Overview'] },
            { moduleName: 'Reports', enabled: true, permissions: ['Create', 'View', 'Export'] },
        ],
    },
]

export const addRole = (role: Omit<RoleItem, 'id'>) => {
    INITIAL_ROLES.push({ id: Date.now(), ...role })
}

export const updateRole = (id: number, role: Partial<RoleItem>) => {
    const index = INITIAL_ROLES.findIndex((r) => r.id === id)
    if (index !== -1) {
        INITIAL_ROLES[index] = { ...INITIAL_ROLES[index], ...role }
    }
}

export const deleteRole = (id: number) => {
    const index = INITIAL_ROLES.findIndex((r) => r.id === id)
    if (index !== -1) {
        INITIAL_ROLES.splice(index, 1)
    }
}
