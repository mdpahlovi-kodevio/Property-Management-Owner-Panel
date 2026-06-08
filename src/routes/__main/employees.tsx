import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { StatusConfirm } from '@/components/ui/status-confirm'
import { TrashConfirm } from '@/components/ui/trash-confirm'
import { createFileRoute } from '@tanstack/react-router'
import { Check, ChevronDown, Edit, Plus, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import * as z from 'zod'
import { EMPLOYEES, createEmployee, updateEmployee, toggleEmployeeStatus, deleteEmployee, type Employee } from '#/lib/employees'

export const Route = createFileRoute('/__main/employees')({
    component: RouteComponent,
})

const employeeSchema = z.object({
    name: z.string().min(1, 'Full name is required'),
    email: z.email('Please enter a valid email address'),
    phone: z.string(),
    image: z.string(),
    role: z.enum(['Manager', 'Super Admin', 'Maintenance Staff', 'Accountant', 'Customer Support', 'Property Inspector', 'Marketing Specialist', 'IT Administrator', 'Sales Representative', 'HR Manager', 'Legal Advisor', 'Data Analyst']),
    status: z.enum(['Active', 'Blocked']),
})

function RouteComponent() {
    const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES)
    const [searchQuery, setSearchQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

    const isEditMode = editingEmployee !== null

    const openAdd = () => {
        setEditingEmployee(null)
        setIsOpen(true)
    }

    const openEdit = (employee: Employee) => {
        setEditingEmployee(employee)
        setIsOpen(true)
    }

    const closeDialog = () => {
        setIsOpen(false)
        setEditingEmployee(null)
    }

    const handleSave = (values: z.infer<typeof employeeSchema>) => {
        if (isEditMode) {
            updateEmployee(editingEmployee.id, values)
        } else {
            createEmployee({
                ...values,
                image: `https://api.dicebear.com/7.x/notionists/svg?seed=${values.name.replace(' ', '')}`,
            })
        }
        setEmployees([...EMPLOYEES])
        closeDialog()
    }

    const filteredEmployees = useMemo(() => {
        if (!searchQuery.trim()) return employees
        const query = searchQuery.toLowerCase()
        return employees.filter(
            (e) =>
                e.name.toLowerCase().includes(query) ||
                e.email.toLowerCase().includes(query) ||
                e.phone.toLowerCase().includes(query) ||
                e.role.toLowerCase().includes(query),
        )
    }, [employees, searchQuery])

    const handleToggleStatus = (id: number) => {
        toggleEmployeeStatus(id)
        setEmployees([...EMPLOYEES])
    }

    const handleDeleteEmployee = (id: number) => {
        deleteEmployee(id)
        setEmployees([...EMPLOYEES])
    }

    const columns: DataTableColumn<Employee>[] = useMemo(
        () => [
            {
                key: 'name',
                header: 'Employee',
                className: 'flex items-center gap-3',
                render: (user) => (
                    <>
                        <div className="size-8 rounded-full overflow-hidden">
                            <img src={user.image} alt={user.name} className="size-full object-cover" />
                        </div>
                        {user.name}
                    </>
                ),
            },
            { key: 'email', header: 'Email', render: (emp) => <span className="text-muted-foreground">{emp.email}</span> },
            { key: 'phone', header: 'Phone Number', render: (emp) => <span className="text-muted-foreground">{emp.phone}</span> },
            { key: 'role', header: 'Role', render: (emp) => <span className="text-muted-foreground">{emp.role}</span> },
            {
                key: 'status',
                header: 'Status',
                render: (emp) =>
                    emp.status === 'Active' ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full">Active</span>
                    ) : (
                        <span className="text-xs font-semibold text-red-600 bg-red-500/10 px-2.5 py-1 rounded-full">Blocked</span>
                    ),
            },
            {
                key: 'action',
                header: 'Action',
                render: (emp) => (
                    <EmployeeActionCell
                        employee={emp}
                        onEdit={() => openEdit(emp)}
                        onToggleStatus={() => handleToggleStatus(emp.id)}
                        onDelete={() => handleDeleteEmployee(emp.id)}
                    />
                ),
            },
        ],
        [],
    )

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="Employee" description="Manage your reports" />
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search" className="w-full sm:w-[320px]" />
                    <Button onClick={openAdd} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Employee
                    </Button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredEmployees}
                noun="employees"
                emptyIcon={<Users className="h-6 w-6" />}
                onReset={() => setSearchQuery('')}
            />

            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) closeDialog()
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">{isEditMode ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                            {isEditMode
                                ? `Modify details for ${editingEmployee.name}.`
                                : 'Enter the details of the new employee to register them in the management panel.'}
                        </DialogDescription>
                    </DialogHeader>

                    <EmployeeForm
                        key={editingEmployee?.id ?? 'add'}
                        defaultValues={
                            editingEmployee
                                ? {
                                    name: editingEmployee.name,
                                    email: editingEmployee.email,
                                    phone: editingEmployee.phone,
                                    image: editingEmployee.image,
                                    role: editingEmployee.role as any,
                                    status: editingEmployee.status as 'Active' | 'Blocked',
                                }
                                : { name: '', email: '', phone: '', image: '', role: 'Manager', status: 'Active' }
                        }
                        onSubmit={handleSave}
                        onCancel={closeDialog}
                        submitLabel={isEditMode ? 'Save Changes' : 'Register Employee'}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}

function EmployeeForm({
    defaultValues,
    onSubmit,
    onCancel,
    submitLabel,
}: {
    defaultValues: {
        name: string
        email: string
        phone: string
        image: string
        role: 'Manager' | 'Super Admin' | 'Maintenance Staff' | 'Accountant' | 'Customer Support' | 'Property Inspector' | 'Marketing Specialist' | 'IT Administrator' | 'Sales Representative' | 'HR Manager' | 'Legal Advisor' | 'Data Analyst'
        status: 'Active' | 'Blocked'
    }
    onSubmit: (values: z.infer<typeof employeeSchema>) => void
    onCancel: () => void
    submitLabel: string
}) {
    const form = useAppForm({
        defaultValues,
        validators: { onChange: employeeSchema },
        onSubmit: async ({ value }) => onSubmit(value),
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            <form.AppField name="image">{(field) => <field.FormAvatar folder="employees" />}</form.AppField>

            <form.AppField name="name">{(field) => <field.FormInput label="Full Name" placeholder="e.g. Jane Cooper" />}</form.AppField>

            <form.AppField name="email">
                {(field) => <field.FormInput type="email" label="Email Address" placeholder="e.g. janecoper@gmail.com" />}
            </form.AppField>

            <form.AppField name="phone">
                {(field) => <field.FormInput label="Phone Number" placeholder="e.g. +1 416 555 0192" />}
            </form.AppField>

            <form.AppField name="role">
                {(field) => (
                    <field.FormSelect
                        label="Role"
                        placeholder="Select a role"
                        options={[
                            { value: 'Manager', label: 'Manager' },
                            { value: 'Super Admin', label: 'Super Admin' },
                            { value: 'Maintenance Staff', label: 'Maintenance Staff' },
                            { value: 'Accountant', label: 'Accountant' },
                            { value: 'Customer Support', label: 'Customer Support' },
                            { value: 'Property Inspector', label: 'Property Inspector' },
                            { value: 'Marketing Specialist', label: 'Marketing Specialist' },
                            { value: 'IT Administrator', label: 'IT Administrator' },
                            { value: 'Sales Representative', label: 'Sales Representative' },
                            { value: 'HR Manager', label: 'HR Manager' },
                            { value: 'Legal Advisor', label: 'Legal Advisor' },
                            { value: 'Data Analyst', label: 'Data Analyst' },
                        ]}
                    />
                )}
            </form.AppField>

            <form.AppField name="status">
                {(field) => (
                    <div className="space-y-1.5">
                        <Label>Status</Label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    checked={field.state.value === 'Active'}
                                    onChange={() => field.handleChange('Active')}
                                    className="h-4 w-4 accent-primary"
                                />
                                Active
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    checked={field.state.value === 'Blocked'}
                                    onChange={() => field.handleChange('Blocked')}
                                    className="h-4 w-4 accent-primary"
                                />
                                Blocked
                            </label>
                        </div>
                    </div>
                )}
            </form.AppField>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} className="px-4 py-2 text-sm cursor-pointer">
                    Cancel
                </Button>
                <form.AppForm>
                    <form.FormSubmit label={submitLabel} />
                </form.AppForm>
            </DialogFooter>
        </form>
    )
}

function EmployeeActionCell({
    employee,
    onEdit,
    onToggleStatus,
    onDelete,
}: {
    employee: Employee
    onEdit: () => void
    onToggleStatus: () => void
    onDelete: () => void
}) {
    const [statusOpen, setStatusOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm">
                        Action <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuItem onClick={onEdit}>
                        <Edit className="size-3.5" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setStatusOpen(true)}>
                        <Check className="size-3.5" /> Toggle Status
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                        <Trash2 className="size-3.5" /> Delete Employee
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <StatusConfirm
                open={statusOpen}
                onOpenChange={setStatusOpen}
                name={employee.name}
                currentStatus={employee.status}
                newStatus={employee.status === 'Active' ? 'Blocked' : 'Active'}
                onConfirm={onToggleStatus}
            />
            <TrashConfirm
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                name={employee.name}
                onConfirm={onDelete}
            />
        </>
    )
}