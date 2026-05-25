import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { cn } from '@/lib/utils'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Send } from 'lucide-react'
import { useRef, useState } from 'react'

export const Route = createFileRoute('/__main/support/$id')({
    component: RouteComponent,
})

// Mock data for the support ticket
const TICKET = {
    id: '#123',
    title: 'Water leak in bathroom ceiling',
    statuses: ['Open', 'Urgent'] as const,
    description:
        'There is a significant water leak coming from the bathroom ceiling. It appears to be getting worse and water is dripping onto the floor. This seems to be coming from the unit above. Please send someone urgently as it is damaging the ceiling and creating a slip hazard. There is a significant water leak coming from the bathroom ceiling. It appears to be getting worse and water is dripping onto the floor. This seems to be coming from the unit above. Please send someone urgently as it is damaging the ceiling and creating a slip hazard.',
    assignedMember: 'John Cooper',
}

interface ChatMessage {
    id: number
    sender: string
    avatar?: string
    message: string
    time: string
    isAdmin: boolean
}

const INITIAL_MESSAGES: ChatMessage[] = [
    {
        id: 1,
        sender: 'James Donovan',
        message: 'The leak has gotten worse in the last hour. Water is now dripping steadily.',
        time: '10:15 am',
        isAdmin: false,
    },
    {
        id: 2,
        sender: 'James Donovan',
        message: "We've been notified and are dispatching an emergency plumber.",
        time: '10:21 am',
        isAdmin: true,
    },
]

const getStatusClasses = (status: string) => {
    switch (status) {
        case 'Open':
            return 'text-blue-600 bg-blue-500/10'
        case 'Urgent':
            return 'text-red-600 bg-red-500/10'
        case 'In Progress':
            return 'text-orange-600 bg-orange-500/10'
        case 'Resolved':
            return 'text-slate-600 bg-slate-500/10'
        case 'Close':
            return 'text-green-600 bg-green-500/10'
        default:
            return 'text-slate-600 bg-slate-500/10'
    }
}

function RouteComponent() {
    const { id } = Route.useParams()
    const [searchQuery, setSearchQuery] = useState('')
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return

        const message: ChatMessage = {
            id: messages.length + 1,
            sender: 'Admin',
            message: newMessage.trim(),
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase(),
            isAdmin: true,
        }

        setMessages((prev) => [...prev, message])
        setNewMessage('')

        // Scroll to bottom after sending
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
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
                        <span className="font-bold text-primary text-lg">{id}</span>
                        {TICKET.statuses.map((status) => (
                            <span key={status} className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusClasses(status)}`}>
                                {status}
                            </span>
                        ))}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-foreground">{TICKET.title}</h3>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-foreground">Description</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{TICKET.description}</p>
                    </div>

                    {/* Assigned Member */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-foreground">Assigned Member</h4>
                        <p className="text-sm text-muted-foreground">{TICKET.assignedMember}</p>
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
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn('flex gap-3', msg.isAdmin ? 'flex-row-reverse' : 'flex-row')}>
                                {/* Avatar */}
                                <Avatar size="sm" className="shrink-0 mt-0.5">
                                    {msg.avatar ? <AvatarImage src={msg.avatar} alt={msg.sender} /> : null}
                                    <AvatarFallback>{msg.sender}</AvatarFallback>
                                </Avatar>

                                {/* Message Bubble */}
                                <div className={cn('flex flex-col gap-1 max-w-[75%]', msg.isAdmin ? 'items-end' : 'items-start')}>
                                    <span className="text-xs font-semibold text-foreground">{msg.sender}</span>
                                    <div
                                        className={cn(
                                            'text-sm leading-relaxed rounded-xl px-4 py-2.5',
                                            msg.isAdmin
                                                ? 'bg-primary/5 text-foreground rounded-tr-sm'
                                                : 'bg-muted text-foreground rounded-tl-sm',
                                        )}
                                    >
                                        {msg.message}
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">{msg.time}</span>
                                </div>
                            </div>
                        ))}
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
                                placeholder="Typing here"
                                className="flex-1 text-sm bg-transparent border border-input rounded-lg px-3 py-2 h-9 outline-none placeholder:text-muted-foreground/60 focus:border-primary/50 transition-colors"
                            />
                            <Button
                                size="sm"
                                onClick={handleSendMessage}
                                disabled={newMessage.trim() === ''}
                                className="h-9 w-9 p-0 rounded-full shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
