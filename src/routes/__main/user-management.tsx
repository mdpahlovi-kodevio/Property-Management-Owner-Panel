import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
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
import type { DataTableColumn } from '@/components/ui/data-table';

export const Route = createFileRoute('/__main/user-management')({
  component: RouteComponent,
})

const userSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.email('Please enter a valid email address'),
  phone: z.string(),
  bookings: z.number().min(0, 'Must be at least 0'),
  status: z.enum(['Active', 'Blocked']),
})

const INITIAL_USERS = [
  { id: 1, name: 'Jane Cooper', phone: '+1 416 XXX XXXX', email: 'janecoper@gmail.com', bookings: 4, status: 'Active' as const },
  { id: 2, name: 'Wade Warren', phone: '+1 416 XXX XXXX', email: 'weaver@example.com', bookings: 5, status: 'Active' as const },
  { id: 3, name: 'Esther Howard', phone: '+1 416 XXX XXXX', email: 'esther@gmail.com', bookings: 3, status: 'Active' as const },
  { id: 4, name: 'Leslie Alexander', phone: '+1 416 XXX XXXX', email: 'leslie@gmail.com', bookings: 7, status: 'Active' as const },
  { id: 5, name: 'Jenny Wilson', phone: '+1 416 XXX XXXX', email: 'janecoper@gmail.com', bookings: 3, status: 'Active' as const },
  { id: 6, name: 'Guy Hawkins', phone: '+1 416 XXX XXXX', email: 'hawkins@gmail.com', bookings: 2, status: 'Active' as const },
  { id: 7, name: 'Robert Fox', phone: '+1 416 XXX XXXX', email: 'robert@gmail.com', bookings: 4, status: 'Active' as const },
  { id: 8, name: 'Kristin Watson', phone: '+1 416 XXX XXXX', email: 'kristin@gmail.com', bookings: 2, status: 'Blocked' as const },
  { id: 9, name: 'Jacob Jones', phone: '+1 416 XXX XXXX', email: 'jacob@gmail.com', bookings: 4, status: 'Active' as const },
  { id: 10, name: 'Bessie Cooper', phone: '+1 416 XXX XXXX', email: 'bessie@gmail.com', bookings: 2, status: 'Active' as const },
  { id: 11, name: 'Albert Flores', phone: '+1 416 XXX XXXX', email: 'albert@gmail.com', bookings: 2, status: 'Active' as const },
  { id: 12, name: 'Dianne Russell', phone: '+1 416 XXX XXXX', email: 'dianne@gmail.com', bookings: 3, status: 'Blocked' as const },
  { id: 13, name: 'Eleanor Pena', phone: '+1 416 XXX XXXX', email: 'eleanor@gmail.com', bookings: 4, status: 'Blocked' as const },
]

type User = (typeof INITIAL_USERS)[number]

function RouteComponent() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const isEditMode = editingUser !== null

  const openAdd = () => {
    setEditingUser(null)
    setIsOpen(true)
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setIsOpen(true)
  }

  const closeDialog = () => {
    setIsOpen(false)
    setEditingUser(null)
  }

  const handleSave = (values: z.infer<typeof userSchema>) => {
    if (isEditMode) {
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...values } : u)))
    } else {
      const newUser: User = {
        id: Date.now(),
        ...values,
      }
      setUsers((prev) => [...prev, newUser])
    }
    closeDialog()
  }

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const query = searchQuery.toLowerCase()
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.phone.toLowerCase().includes(query),
    )
  }, [users, searchQuery])

  const handleToggleStatus = (id: number) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u)))
  }

  const handleDeleteUser = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  const columns: DataTableColumn<User>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        className: 'font-medium',
        render: (user) => <span className="text-muted-foreground">{user.name}</span>,
      },
      { key: 'phone', header: 'Phone Number', render: (user) => <span className="text-muted-foreground">{user.phone}</span> },
      { key: 'email', header: 'Email', render: (user) => <span className="text-muted-foreground">{user.email}</span> },
      { key: 'bookings', header: 'Bookings', render: (user) => <span className="text-muted-foreground">{user.bookings}</span> },
      {
        key: 'status',
        header: 'Status',
        render: (user) =>
          user.status === 'Active' ? (
            <span className="text-sm font-medium text-green-500">Active</span>
          ) : (
            <span className="text-sm font-medium text-red-500">Blocked</span>
          ),
      },
      {
        key: 'action',
        header: 'Action',
        render: (user) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-[#24357B] hover:bg-[#24357B]/90 text-white rounded-md h-9">
                Action <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem onClick={() => openEdit(user)}>
                <Edit className="size-3.5" /> Edit Details
              </DropdownMenuItem>
              <StatusConfirm
                name={user.name}
                currentStatus={user.status}
                newStatus={user.status === 'Active' ? 'Blocked' : 'Active'}
                onConfirm={() => handleToggleStatus(user.id)}
              >
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Check className="size-3.5" /> Toggle Status
                </DropdownMenuItem>
              </StatusConfirm>
              <TrashConfirm name={user.name} onConfirm={() => handleDeleteUser(user.id)}>
                <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="size-3.5" /> Delete User
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <PageHeader title="Users Management" description="Manage your Users" />
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search" className="w-full sm:w-[320px]" />
                    <Button onClick={openAdd} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        noun="users"
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
            <DialogTitle className="text-lg font-semibold">{isEditMode ? 'Edit User' : 'Add User'}</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {isEditMode
                ? `Modify details for ${editingUser.name}.`
                : 'Enter the details of the new user to register them.'}
            </DialogDescription>
          </DialogHeader>

          <UserForm
            key={editingUser?.id ?? 'add'}
            defaultValues={
              editingUser
                ? {
                  name: editingUser.name,
                  email: editingUser.email,
                  phone: editingUser.phone,
                  bookings: editingUser.bookings,
                  status: editingUser.status,
                }
                : { name: '', email: '', phone: '', bookings: 0, status: 'Active' }
            }
            onSubmit={handleSave}
            onCancel={closeDialog}
            submitLabel={isEditMode ? 'Save Changes' : 'Register User'}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

function UserForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  defaultValues: {
    name: string
    email: string
    phone: string
    bookings: number
    status: 'Active' | 'Blocked'
  }
  onSubmit: (values: z.infer<typeof userSchema>) => void
  onCancel: () => void
  submitLabel: string
}) {
  const form = useAppForm({
    defaultValues,
    validators: { onChange: userSchema },
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
      <form.AppField name="name">{(field) => <field.FormInput label="Full Name" placeholder="e.g. Jane Cooper" />}</form.AppField>

      <form.AppField name="email">
        {(field) => <field.FormInput type="email" label="Email Address" placeholder="e.g. janecoper@gmail.com" />}
      </form.AppField>

      <form.AppField name="phone">
        {(field) => <field.FormInput label="Phone Number" placeholder="e.g. +1 416 555 0192" />}
      </form.AppField>

      <form.AppField name="bookings">
        {(field) => <field.FormInput type="number" label="Bookings" placeholder="e.g. 4" />}
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