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
import { USERS, createUser, updateUser, toggleUserStatus, deleteUser, type User } from '#/lib/users'

export const Route = createFileRoute('/__main/user-management')({
    component: RouteComponent,
})

const userSchema = z.object({
    name: z.string().min(1, 'Full name is required'),
    email: z.email('Please enter a valid email address'),
    phone: z.string(),
    image: z.string(),
    bookings: z.number().min(0, 'Must be at least 0'),
    status: z.enum(['Active', 'Blocked']),
})

function RouteComponent() {
    const [users, setUsers] = useState<User[]>(USERS)
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
            updateUser(editingUser.id, values)
        } else {
            createUser(values)
        }
        setUsers([...USERS])
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
        toggleUserStatus(id)
        setUsers([...USERS])
    }

    const handleDeleteUser = (id: number) => {
        deleteUser(id)
        setUsers([...USERS])
    }

    const columns: DataTableColumn<User>[] = useMemo(
        () => [
            {
                key: 'name',
                header: 'Name',
                className: 'flex items-center gap-3 font-medium',
                render: (user) => (
                    <>
                        <div className="size-8 rounded-full overflow-hidden shrink-0 bg-slate-100">
                            <img src={user.image} alt={user.name} className="size-full object-cover" />
                        </div>
                        <span className="text-muted-foreground">{user.name}</span>
                    </>
                ),
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
                    <UserActionCell
                        user={user}
                        onEdit={() => openEdit(user)}
                        onToggleStatus={() => handleToggleStatus(user.id)}
                        onDelete={() => handleDeleteUser(user.id)}
                    />
                ),
            },
        ],
        [],
    )

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                                    image: editingUser.image,
                                    bookings: editingUser.bookings,
                                    status: editingUser.status,
                                }
                                : { name: '', email: '', phone: '', image: '', bookings: 0, status: 'Active' }
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
        image: string
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
            <form.AppField name="image">{(field) => <field.FormAvatar folder="users" />}</form.AppField>

            <form.AppField name="name">{(field) => <field.FormInput label="Full Name" placeholder="e.g. Jane Cooper" />}</form.AppField>

            <form.AppField name="email">
                {(field) => <field.FormInput type="email" label="Email Address" placeholder="e.g. janecoper@gmail.com" />}
            </form.AppField>

            <form.AppField name="phone">
                {(field) => <field.FormInput label="Phone Number" placeholder="e.g. +1 416 555 0192" />}
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

function UserActionCell({
    user,
    onEdit,
    onToggleStatus,
    onDelete,
}: {
    user: User
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
                    <Button size="sm" className="bg-[#24357B] hover:bg-[#24357B]/90 text-white rounded-md h-9">
                        Action <ChevronDown className="ml-1 h-4 w-4" />
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
                        <Trash2 className="size-3.5" /> Delete User
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <StatusConfirm
                open={statusOpen}
                onOpenChange={setStatusOpen}
                name={user.name}
                currentStatus={user.status}
                newStatus={user.status === 'Active' ? 'Blocked' : 'Active'}
                onConfirm={onToggleStatus}
            />
            <TrashConfirm
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                name={user.name}
                onConfirm={onDelete}
            />
        </>
    )
}
