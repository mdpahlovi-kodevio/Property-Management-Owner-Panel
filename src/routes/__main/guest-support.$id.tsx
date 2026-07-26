import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { guestSupportApi } from '@/lib/api'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calendar, ChevronUp, Send, SearchX } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/__main/guest-support/$id')({
    component: RouteComponent,
})

const MESSAGES_PAGE_SIZE = 20

const STATUS_LABELS: Record<string, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
}

const PRIORITY_LABELS: Record<string, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
}

const getStatusClasses = (status: string) => {
    switch (status) {
        case 'OPEN':
            return 'text-blue-600 bg-blue-500/10'
        case 'IN_PROGRESS':
            return 'text-orange-600 bg-orange-500/10'
        case 'RESOLVED':
            return 'text-slate-600 bg-slate-500/10'
        case 'CLOSED':
            return 'text-green-600 bg-green-500/10'
        default:
            return 'text-slate-600 bg-slate-500/10'
    }
}

const getPriorityClasses = (priority: string) => {
    switch (priority) {
        case 'URGENT':
            return 'text-red-600 bg-red-500/10'
        case 'HIGH':
            return 'text-orange-600 bg-orange-500/10'
        case 'MEDIUM':
            return 'text-blue-600 bg-blue-500/10'
        case 'LOW':
            return 'text-slate-600 bg-slate-500/10'
        default:
            return 'text-slate-600 bg-slate-500/10'
    }
}

function formatTime(dateString: string): string {
    return new Date(dateString)
        .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        .toLowerCase()
}

function formatDateTime(dateString: string): string {
    const date = new Date(dateString)
    return (
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
        ' ' +
        date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
    )
}

function formatDateSeparator(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

function getDateKey(dateString: string): string {
    return new Date(dateString).toISOString().split('T')[0]
}

function RouteComponent() {
    const { id } = Route.useParams()
    const queryClient = useQueryClient()
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const prevScrollHeightRef = useRef<number>(0)

    // ── Ticket metadata ──
    const { data: ticketData, isLoading } = useQuery({
        queryKey: ['guest-support-ticket', id],
        queryFn: () => guestSupportApi.getTicket(id),
    })
    const ticket = ticketData?.data

    // ── Paginated messages ──
    const messagesQuery = useInfiniteQuery({
        queryKey: ['guest-support-messages', id],
        queryFn: ({ pageParam }) => guestSupportApi.listMessages(id, { cursor: pageParam, limit: MESSAGES_PAGE_SIZE }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => (lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined),
        refetchInterval: 15000,
    })

    const messages = useMemo(() => {
        const pages = messagesQuery.data?.pages ?? []
        return [...pages].reverse().flatMap((p) => p.data)
    }, [messagesQuery.data])

    // ── Scroll to load older ──
    const handleScroll = useCallback(() => {
        const el = scrollContainerRef.current
        if (!el) return
        if (el.scrollTop < 80 && messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
            prevScrollHeightRef.current = el.scrollHeight
            messagesQuery.fetchNextPage()
        }
    }, [messagesQuery])

    useEffect(() => {
        const el = scrollContainerRef.current
        if (!el || prevScrollHeightRef.current === 0) return
        const diff = el.scrollHeight - prevScrollHeightRef.current
        if (diff > 0) el.scrollTop = el.scrollTop + diff
        prevScrollHeightRef.current = 0
    }, [messages.length])

    const hasScrolledToBottomRef = useRef(false)
    useEffect(() => {
        if (messages.length > 0 && !hasScrolledToBottomRef.current && !messagesQuery.isLoading) {
            hasScrolledToBottomRef.current = true
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100)
        }
    }, [messages.length, messagesQuery.isLoading])

    // ── Send message ──
    const sendMutation = useMutation({
        mutationFn: (message: string) => guestSupportApi.sendMessage(id, { message }),
        onSuccess: () => {
            setNewMessage('')
            queryClient.invalidateQueries({ queryKey: ['guest-support-messages', id] })
            queryClient.invalidateQueries({ queryKey: ['guest-support-ticket', id] })
            queryClient.invalidateQueries({ queryKey: ['guest-support-tickets'] })
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to send message'),
    })

    const handleSendMessage = () => {
        if (newMessage.trim() === '' || sendMutation.isPending) return
        sendMutation.mutate(newMessage.trim())
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner className="h-8 w-8" />
            </div>
        )
    }

    if (!ticket) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="p-3 bg-muted rounded-full text-muted-foreground animate-pulse">
                    <SearchX className="h-6 w-6" />
                </div>
                <div className="max-w-xs">
                    <h3 className="font-semibold text-foreground">Ticket not found</h3>
                    <p className="text-sm text-muted-foreground">This support ticket could not be found or may have been deleted.</p>
                </div>
                <Link to="/guest-support">
                    <Button variant="outline" size="sm">
                        Back to Guest Support
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Link
                    to="/guest-support"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group w-fit"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    <span className="text-sm font-medium">Back to Guest Support</span>
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-primary bg-primary/5 px-2 py-1 rounded-md">
                        {ticket.reference}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${getPriorityClasses(ticket.priority)}`}>
                        {PRIORITY_LABELS[ticket.priority]}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${getStatusClasses(ticket.status)}`}>
                        {STATUS_LABELS[ticket.status]}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5">
                {/* Left: Ticket Details */}
                <div className="flex flex-col gap-4">
                    <h1 className="text-xl font-bold text-foreground leading-tight">{ticket.title}</h1>

                    {/* Description */}
                    <div className="border rounded-xl bg-card p-5">
                        <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                    </div>

                    {/* Guest & Booking Info */}
                    <div className="border rounded-xl bg-card p-5">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Guest Information</h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Guest</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <Avatar size="sm">
                                        {ticket.guestAvatar ? <AvatarImage src={ticket.guestAvatar} /> : null}
                                        <AvatarFallback className="text-[10px]">{getInitials(ticket.guestName)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{ticket.guestName}</p>
                                        <p className="text-[11px] text-muted-foreground">{ticket.guestEmail}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Property</span>
                                <span className="text-sm font-medium text-foreground mt-1">{ticket.propertyName}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Booking Reference</span>
                                <span className="text-sm font-medium text-primary mt-1">{ticket.bookingReference}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Category</span>
                                <span className="text-sm font-medium text-foreground capitalize mt-1">
                                    {ticket.category.toLowerCase().replace(/_/g, ' ')}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Stay Dates</span>
                                <span className="text-sm font-medium text-foreground mt-1 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                    {formatDate(ticket.bookingCheckIn)} — {formatDate(ticket.bookingCheckOut)}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Assigned to</span>
                                <span className="text-sm font-medium text-foreground mt-1">
                                    {ticket.assignedToName ?? 'Not assigned yet'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Conversation */}
                <div className="flex flex-col border border-border/60 rounded-xl bg-card overflow-hidden lg:sticky lg:top-4 lg:self-start lg:h-[calc(100vh-8rem)]">
                    {/* Header */}
                    <div className="px-5 py-3.5 border-b border-border/60 shrink-0">
                        <h4 className="text-sm font-semibold text-foreground">Conversation</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            {messages.length > 0
                                ? `${messages.length} message${messages.length !== 1 ? 's' : ''}`
                                : 'No messages yet'}
                        </p>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1 min-h-0"
                    >
                        {messagesQuery.hasNextPage && (
                            <div className="flex justify-center py-3">
                                {messagesQuery.isFetchingNextPage ? (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Spinner className="h-3 w-3" />
                                        Loading older messages...
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-muted-foreground h-7"
                                        onClick={() => messagesQuery.fetchNextPage()}
                                    >
                                        <ChevronUp className="h-3 w-3 mr-1" />
                                        Load older messages
                                    </Button>
                                )}
                            </div>
                        )}

                        {messages.length === 0 && !messagesQuery.isLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
                                <p className="text-sm font-medium">No messages yet</p>
                                <p className="text-xs mt-1">Send a message to start the conversation</p>
                            </div>
                        )}

                        {messagesQuery.isLoading && (
                            <div className="flex justify-center py-8">
                                <Spinner className="h-6 w-6" />
                            </div>
                        )}

                        {messages.map((msg, idx) => {
                            const isGuest = msg.senderUserId !== 'owner-current'
                            const prevMsg = idx > 0 ? messages[idx - 1] : null
                            const showDateSeparator = !prevMsg || getDateKey(msg.createdAt) !== getDateKey(prevMsg.createdAt)

                            return (
                                <div key={msg.id}>
                                    {showDateSeparator && (
                                        <div className="flex items-center gap-3 py-3">
                                            <div className="flex-1 h-px bg-border" />
                                            <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                                                {formatDateSeparator(msg.createdAt)}
                                            </span>
                                            <div className="flex-1 h-px bg-border" />
                                        </div>
                                    )}

                                    <div className={cn('flex gap-2.5 py-1.5', isGuest ? 'flex-row' : 'flex-row-reverse')}>
                                        <Avatar size="sm" className="shrink-0 mt-0.5">
                                            {msg.sender.image ? (
                                                <AvatarImage src={msg.sender.image} alt={msg.sender.name} />
                                            ) : null}
                                            <AvatarFallback
                                                className={cn(
                                                    'text-[10px]',
                                                    isGuest ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary',
                                                )}
                                            >
                                                {getInitials(msg.sender.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div
                                            className={cn(
                                                'flex flex-col gap-1 max-w-[78%]',
                                                isGuest ? 'items-start' : 'items-end',
                                            )}
                                        >
                                            <span className="text-[11px] font-semibold text-foreground">{msg.sender.name}</span>
                                            <div
                                                className={cn(
                                                    'text-[13px] leading-relaxed rounded-2xl px-3.5 py-2.5 whitespace-pre-wrap',
                                                    isGuest
                                                        ? 'bg-muted text-foreground rounded-tl-sm'
                                                        : 'bg-primary/5 text-foreground rounded-tr-sm',
                                                )}
                                            >
                                                {msg.message}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground px-1">
                                                {formatTime(msg.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-border/60 bg-card/80 backdrop-blur-sm shrink-0">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={sendMutation.isPending}
                                placeholder="Type your message..."
                                className="flex-1 text-sm bg-background border border-input rounded-full px-4 py-2 h-9 outline-none placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
                            />
                            <Button
                                size="sm"
                                onClick={handleSendMessage}
                                disabled={newMessage.trim() === '' || sendMutation.isPending}
                                className="h-9 w-9 p-0 rounded-full shrink-0"
                            >
                                {sendMutation.isPending ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
