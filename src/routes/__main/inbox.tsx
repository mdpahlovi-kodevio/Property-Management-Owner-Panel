import { ConversationThread } from '@/components/conversations/conversation-thread'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { Spinner } from '@/components/ui/spinner'
import { inboxApi } from '@/lib/api'
import type { BookingConversation } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { BedDouble, Building2, CalendarDays, ChevronRight, Clock3, Mail, MessageSquareText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/__main/inbox')({
    component: RouteComponent,
})

const formatStay = (conversation: BookingConversation) => {
    const checkIn = new Date(conversation.checkInDate).toLocaleDateString([], { month: 'short', day: 'numeric' })
    const checkOut = new Date(conversation.checkOutDate).toLocaleDateString([], { month: 'short', day: 'numeric' })
    return `${checkIn} – ${checkOut}`
}

const formatDate = (date: string) => new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })

const formatActivity = (date: string) =>
    new Date(date).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

const getInitials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

function RouteComponent() {
    const { user } = Route.useRouteContext()
    const queryClient = useQueryClient()
    const [activeBookingId, setActiveBookingId] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const conversationsQuery = useQuery({
        queryKey: ['owner-booking-inbox', search],
        queryFn: () => inboxApi.list({ page: 1, limit: 100, search: search || undefined }),
        refetchInterval: 15_000,
    })
    const conversations = conversationsQuery.data?.data ?? []
    const activeConversation = useMemo(
        () => conversations.find((conversation) => conversation.bookingId === activeBookingId) ?? null,
        [activeBookingId, conversations],
    )

    useEffect(() => {
        if (!activeBookingId && conversations[0] && window.innerWidth >= 768) {
            setActiveBookingId(conversations[0].bookingId)
        }
    }, [activeBookingId, conversations])

    const messagesQuery = useQuery({
        queryKey: ['owner-booking-inbox-messages', activeBookingId],
        queryFn: () => inboxApi.listMessages(activeBookingId!, { limit: 50 }),
        enabled: Boolean(activeBookingId),
        refetchInterval: 15_000,
    })

    const sendMutation = useMutation({
        mutationFn: (message: string) => inboxApi.sendMessage(activeBookingId!, message),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['owner-booking-inbox'] })
            queryClient.invalidateQueries({ queryKey: ['owner-booking-inbox-messages', activeBookingId] })
        },
        onError: (error) => toast.error(error.message),
    })

    return (
        <div className="flex h-[calc(100vh-7rem)] min-h-0 flex-1 flex-col gap-6">
            <PageHeader title="Inbox" description="Booking-specific guest requests and stay communication" className="shrink-0" />

            <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
                <aside className={cn('w-full shrink-0 flex-col border-r md:flex md:w-88', activeBookingId ? 'hidden md:flex' : 'flex')}>
                    <div className="border-b p-3">
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search guests or properties..."
                            aria-label="Search guests or properties"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {conversationsQuery.isLoading ? (
                            <div className="grid h-40 place-items-center">
                                <Spinner />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="grid h-56 place-items-center px-6 text-center">
                                <div>
                                    <MessageSquareText className="mx-auto size-7 text-muted-foreground" />
                                    <p className="mt-3 text-sm font-medium">No booking conversations</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Messages open after a reservation is confirmed.</p>
                                </div>
                            </div>
                        ) : (
                            conversations.map((conversation) => {
                                const active = conversation.bookingId === activeBookingId
                                return (
                                    <button
                                        key={conversation.bookingId}
                                        type="button"
                                        onClick={() => setActiveBookingId(conversation.bookingId)}
                                        className={cn(
                                            'mb-1 flex w-full items-start gap-3 rounded-xl p-3 text-left transition',
                                            active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'grid size-10 shrink-0 place-items-center rounded-full',
                                                active ? 'bg-white/15' : 'bg-primary/10 text-primary',
                                            )}
                                        >
                                            <CalendarDays className="size-4.5" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center justify-between gap-2">
                                                <span className="truncate text-sm font-semibold">{conversation.guest.name}</span>
                                                {conversation.unreadCount > 0 && (
                                                    <span
                                                        className={cn(
                                                            'grid size-5 place-items-center rounded-full text-[10px] font-bold',
                                                            active
                                                                ? 'bg-primary-foreground text-primary'
                                                                : 'bg-primary text-primary-foreground',
                                                        )}
                                                    >
                                                        {conversation.unreadCount}
                                                    </span>
                                                )}
                                            </span>
                                            <span
                                                className={cn(
                                                    'mt-0.5 block truncate text-xs',
                                                    active ? 'text-white/75' : 'text-muted-foreground',
                                                )}
                                            >
                                                {conversation.propertyName} · {formatStay(conversation)}
                                            </span>
                                            <span
                                                className={cn(
                                                    'mt-1.5 block truncate text-xs',
                                                    active ? 'text-white/85' : 'text-foreground',
                                                )}
                                            >
                                                {conversation.lastMessage?.message ?? 'Start conversation'}
                                            </span>
                                        </span>
                                        <ChevronRight className="mt-3 size-4 shrink-0 opacity-50" />
                                    </button>
                                )
                            })
                        )}
                    </div>
                </aside>

                {activeConversation ? (
                    <>
                        <div className="flex min-w-0 flex-1 flex-col">
                            <ConversationThread
                                title={activeConversation.guest.name}
                                subtitle={`${activeConversation.bookingReference} · ${activeConversation.propertyName} · Room ${activeConversation.roomNumber}`}
                                currentUserId={user.id}
                                messages={messagesQuery.data?.data ?? []}
                                isLoading={messagesQuery.isLoading}
                                isSending={sendMutation.isPending}
                                canReply={activeConversation.canReply}
                                onBack={() => setActiveBookingId(null)}
                                onSend={(message) => sendMutation.mutate(message)}
                                emptyText="Send a message about this reservation."
                            />
                        </div>

                        <aside className="hidden w-72 shrink-0 overflow-y-auto border-l bg-muted/15 xl:block">
                            <div className="border-b bg-card px-5 py-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guest & stay</p>
                            </div>

                            <div className="space-y-6 p-5">
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-11">
                                        {activeConversation.guest.image && (
                                            <AvatarImage src={activeConversation.guest.image} alt={activeConversation.guest.name} />
                                        )}
                                        <AvatarFallback>{getInitials(activeConversation.guest.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">{activeConversation.guest.name}</p>
                                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                            <Mail className="size-3 shrink-0" />
                                            {activeConversation.guest.email}
                                        </p>
                                    </div>
                                </div>

                                <section>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reservation</p>
                                    <div className="space-y-2 rounded-xl border bg-card p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono text-xs font-semibold text-primary">
                                                {activeConversation.bookingReference}
                                            </span>
                                            <Badge variant="outline" className="capitalize">
                                                {activeConversation.bookingStatus.toLowerCase().replaceAll('_', ' ')}
                                            </Badge>
                                        </div>
                                        <DetailRow icon={Building2} label="Property" value={activeConversation.propertyName} />
                                        <DetailRow
                                            icon={BedDouble}
                                            label="Room"
                                            value={`${activeConversation.roomTypeName} · ${activeConversation.roomNumber}`}
                                        />
                                    </div>
                                </section>

                                <section>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stay dates</p>
                                    <div className="grid grid-cols-2 overflow-hidden rounded-xl border bg-card">
                                        <div className="border-r p-3">
                                            <p className="text-[11px] text-muted-foreground">Check-in</p>
                                            <p className="mt-1 text-xs font-semibold">{formatDate(activeConversation.checkInDate)}</p>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-[11px] text-muted-foreground">Check-out</p>
                                            <p className="mt-1 text-xs font-semibold">{formatDate(activeConversation.checkOutDate)}</p>
                                        </div>
                                    </div>
                                </section>

                                <div className="flex items-start gap-2 border-t pt-4 text-xs text-muted-foreground">
                                    <Clock3 className="mt-0.5 size-3.5 shrink-0" />
                                    <span>Last activity {formatActivity(activeConversation.lastActivityAt)}</span>
                                </div>
                            </div>
                        </aside>
                    </>
                ) : (
                    <div className="hidden flex-1 place-items-center text-center text-muted-foreground md:grid">
                        <div>
                            <MessageSquareText className="mx-auto size-8 opacity-50" />
                            <p className="mt-3 text-sm font-medium">Select a booking</p>
                            <p className="mt-1 text-xs">Each conversation stays tied to one reservation.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
    return (
        <div className="flex gap-2 pt-2 text-xs">
            <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
                <p className="text-muted-foreground">{label}</p>
                <p className="mt-0.5 truncate font-medium">{value}</p>
            </div>
        </div>
    )
}
