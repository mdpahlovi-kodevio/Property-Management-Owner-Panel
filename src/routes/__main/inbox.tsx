import { ConversationThread } from '@/components/conversations/conversation-thread'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { Spinner } from '@/components/ui/spinner'
import { inboxApi } from '@/lib/api'
import type { BookingConversation } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CalendarDays, ChevronRight, MessageSquareText } from 'lucide-react'
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
                        <SearchInput value={search} onValueChange={setSearch} placeholder="Search guests or properties..." />
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
