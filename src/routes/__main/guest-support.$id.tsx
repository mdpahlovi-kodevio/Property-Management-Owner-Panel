import { ConversationThread } from '@/components/conversations/conversation-thread'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { guestSupportApi } from '@/lib/api'
import type { GuestSupportTicketPriority, GuestSupportTicketStatus } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Building2, Globe2, SearchX, UserRound } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/__main/guest-support/$id')({
    component: RouteComponent,
})

const STATUSES: { value: GuestSupportTicketStatus; label: string }[] = [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'SPAM', label: 'Spam' },
]

const PRIORITIES: { value: GuestSupportTicketPriority; label: string }[] = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
]

const getInitials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

function RouteComponent() {
    const { id } = Route.useParams()
    const { user } = Route.useRouteContext()
    const queryClient = useQueryClient()

    const ticketQuery = useQuery({
        queryKey: ['guest-support-ticket', id],
        queryFn: () => guestSupportApi.getTicket(id),
        refetchInterval: 15_000,
    })
    const messagesQuery = useQuery({
        queryKey: ['guest-support-messages', id],
        queryFn: () => guestSupportApi.listMessages(id, { limit: 50 }),
        refetchInterval: 15_000,
    })
    const ticket = ticketQuery.data?.data

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ['guest-support-ticket', id] })
        queryClient.invalidateQueries({ queryKey: ['guest-support-tickets'] })
    }

    const sendMutation = useMutation({
        mutationFn: (message: string) => guestSupportApi.sendMessage(id, { message }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guest-support-messages', id] })
            refresh()
        },
        onError: (error) => toast.error(error.message),
    })

    const statusMutation = useMutation({
        mutationFn: (status: GuestSupportTicketStatus) => guestSupportApi.updateStatus(id, status),
        onSuccess: refresh,
        onError: (error) => toast.error(error.message),
    })

    const priorityMutation = useMutation({
        mutationFn: (priority: GuestSupportTicketPriority) => guestSupportApi.updatePriority(id, priority),
        onSuccess: refresh,
        onError: (error) => toast.error(error.message),
    })

    if (ticketQuery.isLoading) {
        return (
            <div className="grid py-24 place-items-center">
                <Spinner className="size-7" />
            </div>
        )
    }

    if (!ticket) {
        return (
            <div className="grid place-items-center py-20 text-center">
                <div>
                    <SearchX className="mx-auto size-8 text-muted-foreground" />
                    <h2 className="mt-4 font-semibold">Ticket not found</h2>
                    <Button asChild variant="outline" className="mt-4">
                        <Link to="/guest-support">Back to Guest Support</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const canReply = ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS'

    return (
        <div className="flex h-[calc(100vh-7rem)] min-h-0 flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                    to="/guest-support"
                    className="flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Guest Support
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-primary/8 px-2.5 py-2 font-mono text-xs font-semibold text-primary">
                        {ticket.reference}
                    </span>
                    <Select
                        value={ticket.priority}
                        onValueChange={(value) => priorityMutation.mutate(value as GuestSupportTicketPriority)}
                        disabled={priorityMutation.isPending}
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PRIORITIES.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value}>
                                    {priority.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={ticket.status}
                        onValueChange={(value) => statusMutation.mutate(value as GuestSupportTicketStatus)}
                        disabled={statusMutation.isPending}
                    >
                        <SelectTrigger className="w-36">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
                <section className="min-h-0 overflow-y-auto rounded-xl border bg-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {ticket.category.toLowerCase().replaceAll('_', ' ')}
                    </p>
                    <h1 className="mt-2 text-xl font-bold">{ticket.title}</h1>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{ticket.description}</p>

                    <div className="my-5 border-t" />

                    <div className="flex items-center gap-3">
                        <Avatar>
                            {ticket.guestAvatar && <AvatarImage src={ticket.guestAvatar} alt={ticket.guestName} />}
                            <AvatarFallback>{getInitials(ticket.guestName)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{ticket.guestName}</p>
                            <p className="truncate text-xs text-muted-foreground">{ticket.guestEmail}</p>
                        </div>
                    </div>

                    <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg bg-muted/40 p-3">
                            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Globe2 className="size-3.5" />
                                Website
                            </dt>
                            <dd className="mt-1 text-sm font-medium">{ticket.websiteName}</dd>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3">
                            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Building2 className="size-3.5" />
                                Property
                            </dt>
                            <dd className="mt-1 text-sm font-medium">{ticket.propertyName ?? 'Not specified'}</dd>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3">
                            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <UserRound className="size-3.5" />
                                Assigned to
                            </dt>
                            <dd className="mt-1 text-sm font-medium">{ticket.assignedToName ?? 'Unassigned'}</dd>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3">
                            <dt className="text-xs text-muted-foreground">Created</dt>
                            <dd className="mt-1 text-sm font-medium">{new Date(ticket.createdAt).toLocaleString()}</dd>
                        </div>
                    </dl>

                    {ticket.resolutionNote && (
                        <div className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                            <p className="text-xs font-semibold text-emerald-700">Resolution note</p>
                            <p className="mt-1 text-sm">{ticket.resolutionNote}</p>
                        </div>
                    )}
                </section>

                <section className="min-h-0 overflow-hidden rounded-xl border bg-card">
                    <ConversationThread
                        title={ticket.guestName}
                        subtitle={`${ticket.reference} · ${ticket.websiteName}`}
                        currentUserId={user.id}
                        messages={messagesQuery.data?.data ?? []}
                        isLoading={messagesQuery.isLoading}
                        isSending={sendMutation.isPending}
                        canReply={canReply}
                        onSend={(message) => sendMutation.mutate(message)}
                        emptyText="Reply to this support request."
                    />
                </section>
            </div>
        </div>
    )
}
