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

export const Route = createFileRoute('/__main/employees')({
  component: RouteComponent,
})

const employeeSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.email('Please enter a valid email address'),
  phone: z.string(),
  image: z.string(),
  role: z.enum(['Manager', 'Super Admin', 'Maintenance Staff', 'Accountant']),
  status: z.enum(['Active', 'Blocked']),
})

const INITIAL_EMPLOYEES = [
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
]

type Employee = (typeof INITIAL_EMPLOYEES)[number]

function RouteComponent() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)
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
      setEmployees((prev) => prev.map((e) => (e.id === editingEmployee.id ? { ...e, ...values } : e)))
    } else {
      const newEmployee: Employee = {
        id: Date.now(),
        ...values,
        image: `https://api.dicebear.com/7.x/notionists/svg?seed=${values.name.replace(' ', '')}`,
      }
      setEmployees((prev) => [...prev, newEmployee])
    }
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
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, status: e.status === 'Active' ? 'Blocked' : 'Active' } : e)))
  }

  const handleDeleteEmployee = (id: number) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id))
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                Action <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem onClick={() => openEdit(emp)}>
                <Edit className="size-3.5" /> Edit Details
              </DropdownMenuItem>
              <StatusConfirm
                name={emp.name}
                currentStatus={emp.status}
                newStatus={emp.status === 'Active' ? 'Blocked' : 'Active'}
                onConfirm={() => handleToggleStatus(emp.id)}
              >
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Check className="size-3.5" /> Toggle Status
                </DropdownMenuItem>
              </StatusConfirm>
              <TrashConfirm name={emp.name} onConfirm={() => handleDeleteEmployee(emp.id)}>
                <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="size-3.5" /> Delete Employee
                </DropdownMenuItem>
              </TrashConfirm>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  )

  return (
    <>
      <PageHeader title="Employee" description="Manage your reports" />

      <div className="flex items-center justify-between gap-4">
        <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search" className="sm:w-80" />
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
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
    role: 'Manager' | 'Super Admin' | 'Maintenance Staff' | 'Accountant'
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