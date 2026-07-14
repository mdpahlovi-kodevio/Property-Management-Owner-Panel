import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { SearchInput } from '@/components/ui/search-input'
import { cn } from '@/lib/utils'
import { supportApi } from '@/lib/api'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, SearchX } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/__main/support/$id')({
    component: RouteComponent,
})

const STATUS_LABELS: Record<string, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',
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
        case 'URGENT':
        case 'REJECTED':
            return 'text-red-600 bg-red-500/10'
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
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
}

function formatDateTime(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
        ' ' +
        date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

function RouteComponent() {
    const { id } = Route.useParams()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { data: ticketData, isLoading } = useQuery({
        queryKey: ['support-ticket', id],
        queryFn: () => supportApi.getTicket(id),
    })

    const ticket = ticketData?.data

    const sendMutation = useMutation({
        mutationFn: (message: string) =>
            supportApi.sendMessage(id, { message }),
        onSuccess: () => {
            setNewMessage('')
            queryClient.invalidateQueries({ queryKey: ['support-ticket', id] })
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        },
        onError: (err: Error) => {
            toast.error(err.message || 'Failed to send message')
        },
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

    // Scroll to bottom when ticket loads
    const prevTicketId = useRef<string | null>(null)
    if (ticket && ticket.id !== prevTicketId.current) {
        prevTicketId.current = ticket.id
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
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
                    <p className="text-sm text-muted-foreground">
                        This support ticket could not be found or may have been deleted.
                    </p>
                </div>
                <Link to="/support">
                    <Button variant="outline" size="sm">Back to Support</Button>
                </Link>
            </div>
        )
    }

    return (
        <>
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Link to="/support" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors group w-fit">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    <h2 className="text-lg font-semibold">Support Details</h2>
                </Link>
                <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search" className="sm:w-80" />
            </div>

            {/* Main content area */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5 animate-in fade-in duration-300">
                {/* Left: Ticket Details */}
                <div className="flex flex-col gap-3">
                    {/* Ticket ID & Status Badges */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-primary text-lg">{ticket.reference}</span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getPriorityClasses(ticket.priority)}`}>
                            {PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
                        </span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusClasses(ticket.status)}`}>
                            {STATUS_LABELS[ticket.status] ?? ticket.status}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-foreground">{ticket.title}</h3>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-foreground">Description</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                    </div>

                    {/* Created by */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-foreground">Created By</h4>
                        <div className="flex items-center gap-2">
                            <Avatar size="sm">
                                {ticket.createdBy.image ? <AvatarImage src={ticket.createdBy.image} /> : null}
                                <AvatarFallback>{getInitials(ticket.createdBy.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-foreground">{ticket.createdBy.name}</p>
                                <p className="text-xs text-muted-foreground">{formatDateTime(ticket.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Assigned Member */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-foreground">Assigned Member</h4>
                        <p className="text-sm text-muted-foreground">
                            {ticket.assignedTo?.user.name ?? 'Not assigned yet'}
                        </p>
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-foreground">Category</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                            {ticket.category.toLowerCase().replace(/_/g, ' ')}
                        </p>
                    </div>
                </div>

                {/* Right: Conversation Panel */}
                <div className="flex flex-col border rounded-xl bg-card overflow-hidden shadow-sm">
                    {/* Conversation Header */}
                    <div className="px-5 py-4 border-b bg-card">
                        <h4 className="font-semibold text-foreground">Conversation</h4>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5 min-h-80 max-h-120">
                        {ticket.messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                <p className="text-sm">No messages yet</p>
                                <p className="text-xs mt-1">Send a message to start the conversation</p>
                            </div>
                        )}

                        {ticket.messages.map((msg) => {
                            const isAdmin = msg.senderUserId !== ticket.createdByUserId

                            return (
                                <div key={msg.id} className={cn('flex gap-3', isAdmin ? 'flex-row-reverse' : 'flex-row')}>
                                    {/* Avatar */}
                                    <Avatar size="sm" className="shrink-0 mt-0.5">
                                        {msg.sender.image ? <AvatarImage src={msg.sender.image} alt={msg.sender.name} /> : null}
                                        <AvatarFallback>{getInitials(msg.sender.name)}</AvatarFallback>
                                    </Avatar>

                                    {/* Message Bubble */}
                                    <div className={cn('flex flex-col gap-1 max-w-[75%]', isAdmin ? 'items-end' : 'items-start')}>
                                        <span className="text-xs font-semibold text-foreground">{msg.sender.name}</span>
                                        <div
                                            className={cn(
                                                'text-sm leading-relaxed rounded-xl px-4 py-2.5',
                                                isAdmin
                                                    ? 'bg-primary/5 text-foreground rounded-tr-sm'
                                                    : 'bg-muted text-foreground rounded-tl-sm',
                                            )}
                                        >
                                            {msg.message}
                                        </div>
                                        <span className="text-[11px] text-muted-foreground">
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="px-4 py-3 border-t bg-card">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message..."
                                disabled={sendMutation.isPending}
                                className="flex-1 text-sm bg-transparent border border-input rounded-lg px-3 py-2 h-9 outline-none placeholder:text-muted-foreground/60 focus:border-primary/50 transition-colors disabled:opacity-50"
                            />
                            <Button
                                size="sm"
                                onClick={handleSendMessage}
                                disabled={newMessage.trim() === '' || sendMutation.isPending}
                                className="h-9 w-9 p-0 rounded-full shrink-0"
                            >
                                {sendMutation.isPending ? (
                                    <Spinner className="h-4 w-4" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
