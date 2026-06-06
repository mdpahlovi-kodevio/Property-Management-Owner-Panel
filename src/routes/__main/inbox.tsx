import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import {
    Check,
    CheckCheck,
    Info,
    MoreVertical,
    Paperclip,
    Send,
    ChevronLeft,
    Smile,
    Zap,
    Lock,
    MoreHorizontal,
    Edit2,
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React, { useMemo, useState, useEffect } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/__main/inbox')({
    component: RouteComponent,
})

// ─── Types ────────────────────────────────────────────────────────────────────

type ContactStatus = 'online' | 'offline' | 'away'

interface Contact {
    id: string
    name: string
    avatar: string
    status: ContactStatus
    lastSeen?: string
    lastOnline?: string
    bookingDetails?: string
    notes?: string
}

type MessageStatus = 'sent' | 'delivered' | 'read'

interface Message {
    id: string
    senderId: string
    text: string
    timestamp: string
    status: MessageStatus
    isInternalNote?: boolean
}

interface Conversation {
    id: string
    contact: Contact
    messages: Message[]
    unreadCount: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CURRENT_USER_ID = 'me'

const INITIAL_CONVERSATIONS: Conversation[] = [
    {
        id: 'c1',
        contact: {
            id: 'u1',
            name: 'Wade Warren',
            avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Wade',
            status: 'online',
            bookingDetails: 'Room 202 · 5 Nights',
        },
        unreadCount: 2,
        messages: [
            {
                id: 'm1',
                senderId: 'u1',
                text: 'Hi, we will be arriving around 8 PM. Is that okay?',
                timestamp: '10:30 AM',
                status: 'read',
            },
            {
                id: 'm2',
                senderId: CURRENT_USER_ID,
                text: 'Hello Wade! Noted. The reception is open 24/7, so late check-in is perfectly fine.',
                timestamp: '10:35 AM',
                status: 'read',
            },
            {
                id: 'm3',
                senderId: 'u1',
                text: 'Do you offer airport transfer?',
                timestamp: '11:00 AM',
                status: 'read',
            },
            {
                id: 'm4',
                senderId: 'u1',
                text: 'If so, how much is it for 2 people?',
                timestamp: '11:01 AM',
                status: 'delivered',
            },
        ],
    },
    {
        id: 'c2',
        contact: {
            id: 'u2',
            name: 'Dianne Russell',
            avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Dianne',
            status: 'offline',
            lastSeen: '2 hours ago',
            bookingDetails: 'Room 103 · Checkout tomorrow',
        },
        unreadCount: 0,
        messages: [
            {
                id: 'm1',
                senderId: 'u2',
                text: 'Could we get some extra towels to our room?',
                timestamp: 'Yesterday',
                status: 'read',
            },
            {
                id: 'm2',
                senderId: CURRENT_USER_ID,
                text: 'Absolutely! I will send housekeeping up right away.',
                timestamp: 'Yesterday',
                status: 'read',
            },
            {
                id: 'm3',
                senderId: 'u2',
                text: 'Thank you! We got them.',
                timestamp: 'Yesterday',
                status: 'read',
            },
        ],
    },
    {
        id: 'c3',
        contact: {
            id: 'c1',
            name: 'Eleanor Pena',
            avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
            status: 'online',
            bookingDetails: 'Room 302 · Oct 24 - Oct 29',
            notes: 'Requested a quiet room away from the elevator if possible. Also asked about airport transfer options.',
        },
        unreadCount: 1,
        messages: [
            {
                id: 'm1',
                senderId: 'u3',
                text: 'Is the spa open today?',
                timestamp: '09:15 AM',
                status: 'read',
            },
            {
                id: 'm2',
                senderId: CURRENT_USER_ID,
                text: 'Guest seems to have high expectations, ensure we offer priority booking for the spa.',
                timestamp: '09:16 AM',
                status: 'read',
                isInternalNote: true,
            },
            {
                id: 'm3',
                senderId: CURRENT_USER_ID,
                text: 'Yes, the spa is open until 10 PM. Would you like me to book a session for you?',
                timestamp: '09:20 AM',
                status: 'read',
            },
            {
                id: 'm4',
                senderId: 'u3',
                text: 'Yes please, 2 PM would be perfect.',
                timestamp: '09:25 AM',
                status: 'delivered',
            },
        ],
    },
    {
        id: 'c4',
        contact: {
            id: 'u4',
            name: 'Cody Fisher',
            avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Cody',
            status: 'away',
            lastSeen: '15 mins ago',
            bookingDetails: 'Room 112 · Pending confirmation',
        },
        unreadCount: 0,
        messages: [
            {
                id: 'm1',
                senderId: CURRENT_USER_ID,
                text: 'Dear Cody, we need a copy of your ID to confirm the booking.',
                timestamp: 'Monday',
                status: 'read',
            },
            {
                id: 'm2',
                senderId: 'u4',
                text: 'Sure, I will upload it through the portal tonight.',
                timestamp: 'Monday',
                status: 'read',
            },
        ],
    },
    {
        id: 'c5',
        contact: {
            id: 'u5',
            name: 'Jane Cooper',
            avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jane',
            status: 'offline',
            lastSeen: '1 day ago',
            bookingDetails: 'Room 201 · 2 Nights',
        },
        unreadCount: 0,
        messages: [
            {
                id: 'm1',
                senderId: 'u5',
                text: 'Can we get a late checkout?',
                timestamp: 'Sunday',
                status: 'read',
            },
            {
                id: 'm2',
                senderId: CURRENT_USER_ID,
                text: 'We can extend your checkout until 1 PM complimentary. Any later would incur a half-day charge.',
                timestamp: 'Sunday',
                status: 'read',
            },
        ],
    },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateGroup(timestamp: string) {
    if (timestamp.includes('AM') || timestamp.includes('PM')) return 'Today'
    return timestamp
}

// ─── Component ────────────────────────────────────────────────────────────────

function RouteComponent() {
    const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS)
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all')
    const [newMessage, setNewMessage] = useState('')
    const [isInternalNote, setIsInternalNote] = useState(false)
    const [isInfoOpen, setIsInfoOpen] = useState(false)
    const [typingIn, setTypingIn] = useState<string | null>(null)

    // Modals state
    const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    // Notes state
    const [isEditingNote, setIsEditingNote] = useState(false)
    const [noteDraft, setNoteDraft] = useState("")

    // Initialize first conversation on desktop mount
    useEffect(() => {
        if (window.innerWidth >= 768 && INITIAL_CONVERSATIONS.length > 0) {
            const firstId = INITIAL_CONVERSATIONS[0].id
            setActiveConversationId(firstId)
        }
    }, [])

    // Reset editing note state when conversation changes
    useEffect(() => {
        setIsEditingNote(false)
    }, [activeConversationId])

    // Reference for auto-scrolling to the bottom of messages
    const scrollRef = React.useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [activeConversationId, conversations, typingIn])

    const activeConversation = useMemo(
        () => conversations.find((c) => c.id === activeConversationId),
        [activeConversationId, conversations],
    )

    const filteredConversations = useMemo(() => {
        let list = conversations
        if (filterTab === 'unread') {
            list = list.filter((c) => c.unreadCount > 0)
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            list = list.filter((c) =>
                c.contact.name.toLowerCase().includes(query),
            )
        }
        return list
    }, [conversations, searchQuery, filterTab])

    const handleSendMessage = () => {
        if (!newMessage.trim() || !activeConversationId) return

        const newMsg: Message = {
            id: Date.now().toString(),
            senderId: CURRENT_USER_ID,
            text: newMessage.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            ...(isInternalNote ? { isInternalNote: true } : {}),
        }

        setConversations((prev) =>
            prev.map((conv) => {
                if (conv.id === activeConversationId) {
                    return {
                        ...conv,
                        messages: [...conv.messages, newMsg],
                    }
                }
                return conv
            }),
        )

        setNewMessage('')
        setIsInternalNote(false)

        if (isInternalNote) return // No auto-reply for internal notes

        // Simulate typing indicator
        const currentId = activeConversationId
        setTypingIn(currentId)

        // Simulate auto-reply
        setTimeout(() => {
            setConversations((prev) =>
                prev.map((conv) => {
                    if (conv.id === currentId) {
                        // Update last message status to delivered/read
                        const updatedMessages = [...conv.messages]
                        const lastMsg = updatedMessages[updatedMessages.length - 1]
                        if (lastMsg.senderId === CURRENT_USER_ID) {
                            lastMsg.status = 'read'
                        }
                        return { ...conv, messages: updatedMessages }
                    }
                    return conv
                }),
            )
            setTypingIn(null)
        }, 1500)
    }

    const handleBlockUser = (id: string) => {
        setConversations((prev) => prev.filter((c) => c.id !== id))
        if (activeConversationId === id) {
            setActiveConversationId(null)
        }
        toast.success('User blocked and conversation archived.')
    }

    const handleEditNote = () => {
        setNoteDraft(activeConversation?.contact.notes || '')
        setIsEditingNote(true)
    }

    const handleSaveNote = () => {
        if (!activeConversation) return
        setConversations(prev => prev.map(c =>
            c.id === activeConversation.id
                ? { ...c, contact: { ...c.contact, notes: noteDraft } }
                : c
        ))
        setIsEditingNote(false)
        toast.success('Note saved successfully.')
    }

    return (
        <>
            <PageHeader
                title="Inbox"
                description="Manage your guest communications and requests"
            />

            <div className="flex-1 bg-card border rounded-2xl overflow-hidden flex shadow-sm min-h-0 relative z-0">
                {/* ─── Sidebar ─── */}
                <div
                    className={cn(
                        "w-full md:w-85 flex-col border-r bg-muted/10 shrink-0 z-10 relative",
                        activeConversationId ? "hidden md:flex" : "flex"
                    )}
                >
                    {/* Sidebar Header */}
                    <div className="flex flex-col gap-3 p-4 border-b bg-card shrink-0">
                        <SearchInput
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            placeholder="Search guests..."
                            className="flex-1 bg-muted/50 border-transparent focus-within:bg-background focus-within:border-primary/50 transition-all rounded-xl"
                        />

                        <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as 'all' | 'unread')} className="w-full">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                                <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <p className="text-sm">No conversations found</p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {filteredConversations.map((conv) => {
                                    const isActive = conv.id === activeConversationId
                                    const lastMessage = conv.messages[conv.messages.length - 1]

                                    return (
                                        <div
                                            key={conv.id}
                                            onClick={() => setActiveConversationId(conv.id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    setActiveConversationId(conv.id)
                                                }
                                            }}
                                            className={cn(
                                                'w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all group outline-none',
                                                isActive
                                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                                    : 'hover:bg-muted/50 active:bg-muted cursor-pointer',
                                            )}
                                        >
                                            {/* Avatar & Status */}
                                            <div className="relative shrink-0">
                                                <div
                                                    className={cn(
                                                        'size-12 rounded-full overflow-hidden border-2',
                                                        isActive
                                                            ? 'border-primary-foreground/20'
                                                            : 'border-background',
                                                    )}
                                                >
                                                    <img
                                                        src={conv.contact.avatar}
                                                        alt={conv.contact.name}
                                                        className="size-full object-cover"
                                                    />
                                                </div>
                                                <span
                                                    className={cn(
                                                        'absolute bottom-0.5 right-0.5 size-3 rounded-full border-2',
                                                        isActive ? 'border-primary' : 'border-background',
                                                        conv.contact.status === 'online' && 'bg-emerald-500',
                                                        conv.contact.status === 'away' && 'bg-amber-500',
                                                        conv.contact.status === 'offline' && 'bg-muted-foreground',
                                                    )}
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <p
                                                        className={cn(
                                                            'text-sm font-semibold truncate',
                                                            isActive ? 'text-primary-foreground' : 'text-foreground',
                                                        )}
                                                    >
                                                        {conv.contact.name}
                                                    </p>
                                                    <span
                                                        className={cn(
                                                            'text-[10px] shrink-0 font-medium',
                                                            isActive
                                                                ? 'text-primary-foreground/80'
                                                                : 'text-muted-foreground',
                                                        )}
                                                    >
                                                        {lastMessage.timestamp}
                                                    </span>
                                                </div>
                                                <p
                                                    className={cn(
                                                        'text-xs truncate leading-snug',
                                                        isActive
                                                            ? 'text-primary-foreground/80'
                                                            : 'text-muted-foreground',
                                                        !isActive && conv.unreadCount > 0 && 'text-foreground font-medium',
                                                    )}
                                                >
                                                    {lastMessage.text}
                                                </p>
                                            </div>

                                            {/* Unread Badge & Options */}
                                            <div className="flex flex-col items-end gap-1 shrink-0 mt-0.5 relative z-10">
                                                {conv.unreadCount > 0 ? (
                                                    <div
                                                        className={cn(
                                                            'size-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                                                            isActive
                                                                ? 'bg-primary-foreground text-primary'
                                                                : 'bg-primary text-primary-foreground shadow-sm',
                                                        )}
                                                    >
                                                        {conv.unreadCount}
                                                    </div>
                                                ) : (
                                                    <div className="h-5" /> // spacer
                                                )}

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={cn(
                                                                "size-6 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity",
                                                                isActive ? "text-primary-foreground hover:bg-primary-foreground/20" : "text-muted-foreground hover:bg-muted"
                                                            )}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreHorizontal className="size-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-card w-40">
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast('Conversation marked as unread'); }}>Mark as unread</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast('Conversation archived'); }}>Archive</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleBlockUser(conv.id); }} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                            Block User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Chat Area ─── */}
                {activeConversation ? (
                    <div
                        className={cn(
                            "flex-1 flex-col bg-background relative z-0",
                            activeConversationId ? "flex" : "hidden md:flex"
                        )}
                    >
                        {/* Chat Header */}
                        <div className="h-19 px-4 md:px-6 flex items-center justify-between border-b bg-card/80 backdrop-blur-xl shrink-0 z-10">
                            <div className="flex items-center gap-3 md:gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden shrink-0 -ml-2"
                                    onClick={() => setActiveConversationId(null)}
                                >
                                    <ChevronLeft className="size-5" />
                                </Button>
                                <div className="relative">
                                    <div className="size-10 rounded-full overflow-hidden border">
                                        <img
                                            src={activeConversation.contact.avatar}
                                            alt={activeConversation.contact.name}
                                            className="size-full object-cover"
                                        />
                                    </div>
                                    <span
                                        className={cn(
                                            'absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background',
                                            activeConversation.contact.status === 'online' && 'bg-emerald-500',
                                            activeConversation.contact.status === 'away' && 'bg-amber-500',
                                            activeConversation.contact.status === 'offline' && 'bg-muted-foreground',
                                        )}
                                    />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-foreground leading-tight">
                                        {activeConversation.contact.name}
                                    </h2>
                                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                        <span className="capitalize">{activeConversation.contact.status}</span>
                                        {activeConversation.contact.lastSeen && (
                                            <>
                                                <span className="size-1 rounded-full bg-muted-foreground/30" />
                                                <span>Last seen {activeConversation.contact.lastSeen}</span>
                                            </>
                                        )}
                                        {activeConversation.contact.bookingDetails && (
                                            <>
                                                <span className="size-1 rounded-full bg-muted-foreground/30" />
                                                <span className="text-primary font-medium">
                                                    {activeConversation.contact.bookingDetails}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                                    variant={isInfoOpen ? "secondary" : "ghost"}
                                    size="icon"
                                    className={cn("rounded-full", isInfoOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
                                >
                                    <Info className="size-4.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full hover:text-foreground sm:hidden">
                                    <MoreVertical className="size-4.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5 scroll-smooth">
                            {activeConversation.messages.map((msg, index) => {
                                const isMe = msg.senderId === CURRENT_USER_ID

                                const group = getDateGroup(msg.timestamp)
                                const showGroup = index === 0 || getDateGroup(activeConversation.messages[index - 1].timestamp) !== group

                                const showAvatar =
                                    !isMe &&
                                    (index === 0 ||
                                        activeConversation.messages[index - 1].senderId === CURRENT_USER_ID ||
                                        showGroup)

                                return (
                                    <React.Fragment key={msg.id}>
                                        {showGroup && (
                                            <div className="flex justify-center my-6 first:mt-0">
                                                <span className="bg-card border px-3 py-1 rounded-full text-[10px] font-semibold text-muted-foreground shadow-sm">
                                                    {group}
                                                </span>
                                            </div>
                                        )}
                                        <div
                                            className={cn('flex w-full', isMe ? 'justify-end' : 'justify-start')}
                                        >
                                            <div className={cn('flex max-w-[70%] gap-3', isMe ? 'flex-row-reverse' : 'flex-row')}>
                                                {/* Avatar for incoming messages */}
                                                {!isMe && (
                                                    <div className="shrink-0 w-8 flex flex-col justify-end">
                                                        {showAvatar && (
                                                            <div className="size-8 rounded-full overflow-hidden border bg-card">
                                                                <img
                                                                    src={activeConversation.contact.avatar}
                                                                    alt="avatar"
                                                                    className="size-full object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Bubble Container */}
                                                <div className="flex flex-col gap-1 min-w-0 group/bubble relative">
                                                    {isMe && (
                                                        <div className="absolute top-1/2 -translate-y-1/2 -left-9 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                                                            {/* <Button variant="ghost" size="icon" className="size-7 rounded-full text-muted-foreground bg-card/50 backdrop-blur border shadow-sm hover:bg-card hover:text-foreground">
                                                                <MoreHorizontal className="size-3.5" />
                                                            </Button> */}
                                                        </div>
                                                    )}
                                                    {!isMe && (
                                                        <div className="absolute top-1/2 -translate-y-1/2 -right-9 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                                                            {/* <Button variant="ghost" size="icon" className="size-7 rounded-full text-muted-foreground bg-card/50 backdrop-blur border shadow-sm hover:bg-card hover:text-foreground">
                                                                <MoreHorizontal className="size-3.5" />
                                                            </Button> */}
                                                        </div>
                                                    )}

                                                    {msg.isInternalNote && (
                                                        <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1 mb-0.5 ml-1">
                                                            <Lock className="size-3" /> Internal Note
                                                        </span>
                                                    )}
                                                    <div
                                                        className={cn(
                                                            'px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed relative',
                                                            msg.isInternalNote
                                                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-500/30 rounded-br-sm shadow-sm'
                                                                : isMe
                                                                    ? 'bg-primary text-primary-foreground rounded-br-sm shadow-md shadow-primary/20'
                                                                    : 'bg-card border text-foreground rounded-bl-sm shadow-sm',
                                                        )}
                                                    >
                                                        <p>{msg.text}</p>
                                                    </div>

                                                    {/* Timestamp & Status */}
                                                    <div
                                                        className={cn(
                                                            'flex items-center gap-1.5 text-[10px] text-muted-foreground px-1',
                                                            isMe ? 'justify-end' : 'justify-start',
                                                        )}
                                                    >
                                                        <span>{msg.timestamp}</span>
                                                        {isMe && (
                                                            <span className="flex items-center">
                                                                {msg.status === 'read' ? (
                                                                    <CheckCheck className="size-3.5 text-blue-500" />
                                                                ) : msg.status === 'delivered' ? (
                                                                    <CheckCheck className="size-3.5" />
                                                                ) : (
                                                                    <Check className="size-3.5" />
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                )
                            })}

                            {/* Typing Indicator */}
                            {typingIn === activeConversation.id && (
                                <div className="flex w-full justify-start">
                                    <div className="flex flex-row gap-3">
                                        <div className="shrink-0 w-8 flex flex-col justify-end">
                                            <div className="size-8 rounded-full overflow-hidden border bg-card">
                                                <img
                                                    src={activeConversation.contact.avatar}
                                                    alt="avatar"
                                                    className="size-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-card border text-foreground shadow-sm flex items-center gap-1">
                                            <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-card border-t shrink-0 z-10 flex flex-col gap-2">
                            <div
                                className={cn(
                                    'relative flex items-center rounded-2xl border px-2 py-2 shadow-sm transition-all focus-within:ring-1 focus-within:bg-background',
                                    isInternalNote
                                        ? 'bg-amber-50/50 dark:bg-amber-500/10 border-amber-200 focus-within:ring-amber-400 focus-within:border-amber-400'
                                        : 'bg-muted/40 focus-within:ring-primary/40 focus-within:border-primary/40'
                                )}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "shrink-0 rounded-xl",
                                        isInternalNote ? "text-amber-600 hover:bg-amber-100" : "text-muted-foreground hover:bg-background/80"
                                    )}
                                >
                                    <Paperclip className="size-4.5" />
                                </Button>
                                <input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendMessage()
                                        }
                                    }}
                                    className={cn(
                                        "flex-1 bg-transparent px-3 py-1.5 text-sm focus:outline-none placeholder:text-muted-foreground/60",
                                        isInternalNote && "placeholder:text-amber-600/50 text-amber-900 dark:text-amber-100"
                                    )}
                                    placeholder={isInternalNote ? "Write an internal note (staff only)..." : "Write your message..."}
                                />

                                <div className="flex items-center gap-0.5 mr-1">
                                    <Button variant="ghost" size="icon" className={cn("size-8 rounded-lg", isInternalNote ? "text-amber-600 hover:bg-amber-100" : "text-muted-foreground")}>
                                        <Smile className="size-4" />
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className={cn("size-8 rounded-lg", isInternalNote ? "text-amber-600 hover:bg-amber-100" : "text-muted-foreground")}>
                                                <Zap className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 bg-card" sideOffset={12}>
                                            <DropdownMenuLabel className="text-xs text-muted-foreground">Quick Replies</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setNewMessage("Hello! The WiFi network is 'GuestNet' and the password is 'StayWithUs2026'. Let me know if you need anything else!")}>
                                                WiFi Password
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setNewMessage("Check-in is at 3:00 PM. Our reception is open 24/7, so late check-ins are welcome.")}>
                                                Check-in Instructions
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setNewMessage("Standard checkout is 11:00 AM. If you need a late checkout, please let us know!")}>
                                                Checkout Time
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setNewMessage("We offer secure on-site parking for $15/night. Would you like me to reserve a spot for you?")}>
                                                Parking Info
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <Button
                                    onClick={handleSendMessage}
                                    size="icon"
                                    className={cn(
                                        'shrink-0 rounded-xl h-9 w-9 ml-1 transition-all',
                                        newMessage.trim()
                                            ? isInternalNote
                                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 hover:scale-105'
                                                : 'bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:scale-105'
                                            : 'bg-primary/50 text-primary-foreground/50 pointer-events-none opacity-50',
                                    )}
                                >
                                    <Send className="size-4" />
                                </Button>
                            </div>


                        </div>
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-muted/5 text-muted-foreground relative z-0">
                        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Send className="size-6 opacity-50" />
                        </div>
                        <p className="font-medium">Your messages</p>
                        <p className="text-sm mt-1">Select a conversation to start chatting</p>
                    </div>
                )}

                {/* ─── Guest Info Sidebar (Right) ─── */}
                {activeConversation && isInfoOpen && (
                    <div className="w-75 flex flex-col border-l bg-card shrink-0 z-10 relative lg:flex">
                        <div className="h-19 flex items-center px-4 border-b shrink-0">
                            <h3 className="font-semibold">Guest Details</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {/* Guest Profile */}
                            <div className="flex flex-col items-center text-center">
                                <div className="size-20 rounded-full overflow-hidden border-2 border-muted mb-3 relative">
                                    <img
                                        src={activeConversation.contact.avatar}
                                        alt={activeConversation.contact.name}
                                        className="size-full object-cover"
                                    />
                                </div>
                                <h4 className="font-semibold text-lg">{activeConversation.contact.name}</h4>
                                <p className="text-sm text-muted-foreground capitalize">
                                    {activeConversation.contact.status}
                                </p>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" className="h-8" onClick={() => setIsProfileOpen(true)}>Profile</Button>
                                    <Button variant="outline" size="sm" className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleBlockUser(activeConversation.id)}>Block</Button>
                                </div>
                            </div>

                            <Separator />

                            {/* Booking Info */}
                            <div className="space-y-3">
                                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Current Booking
                                </h5>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status</span>
                                        <span className="font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded text-xs">Confirmed</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Room</span>
                                        <span className="font-medium">{activeConversation.contact.bookingDetails?.split('·')[0].trim() || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Check-in</span>
                                        <span className="font-medium">Oct 24, 2026</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Check-out</span>
                                        <span className="font-medium">Oct 29, 2026</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Guests</span>
                                        <span className="font-medium">2 Adults</span>
                                    </div>
                                </div>
                                <Button variant="secondary" className="w-full mt-2 text-xs">
                                    Manage Booking
                                </Button>
                            </div>

                            <Separator />

                            {/* Notes */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Notes
                                    </h5>
                                    {!isEditingNote && (
                                        <Button variant="ghost" size="icon" className="size-6 h-6 w-6 rounded-full" onClick={handleEditNote}>
                                            <Edit2 className="size-3" />
                                        </Button>
                                    )}
                                </div>
                                {isEditingNote ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={noteDraft}
                                            onChange={(e) => setNoteDraft(e.target.value)}
                                            className="flex min-h-25 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            placeholder="Add notes about this guest..."
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setIsEditingNote(false)}>Cancel</Button>
                                            <Button size="sm" onClick={handleSaveNote}>Save</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg italic min-h-15 whitespace-pre-wrap">
                                        {activeConversation.contact.notes || "No notes added yet. Click edit to add some."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* New Message Dialog */}
            <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>New Message</DialogTitle>
                        <DialogDescription>Select a contact or team to start a new conversation.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 mt-4">
                        <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => {
                            toast.success('Started conversation with Maintenance Team')
                            setIsNewMessageOpen(false)
                        }}>
                            <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                M
                            </div>
                            Maintenance Team
                        </Button>
                        <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => {
                            toast.success('Started conversation with Front Desk')
                            setIsNewMessageOpen(false)
                        }}>
                            <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                F
                            </div>
                            Front Desk
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Guest Profile Dialog */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Guest Profile</DialogTitle>
                    </DialogHeader>
                    {activeConversation && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="size-24 rounded-full overflow-hidden border-4 border-muted">
                                <img src={activeConversation.contact.avatar} alt="avatar" className="size-full object-cover" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold">{activeConversation.contact.name}</h3>
                                <p className="text-sm text-muted-foreground">{activeConversation.contact.status}</p>
                            </div>
                            <div className="w-full grid grid-cols-2 gap-4 mt-4 text-sm">
                                <div className="flex flex-col gap-1 p-3 bg-muted/40 rounded-lg">
                                    <span className="text-muted-foreground text-xs">Email</span>
                                    <span className="font-medium">contact@example.com</span>
                                </div>
                                <div className="flex flex-col gap-1 p-3 bg-muted/40 rounded-lg">
                                    <span className="text-muted-foreground text-xs">Phone</span>
                                    <span className="font-medium">+1 (555) 123-4567</span>
                                </div>
                                <div className="flex flex-col gap-1 p-3 bg-muted/40 rounded-lg">
                                    <span className="text-muted-foreground text-xs">Total Bookings</span>
                                    <span className="font-medium">4</span>
                                </div>
                                <div className="flex flex-col gap-1 p-3 bg-muted/40 rounded-lg">
                                    <span className="text-muted-foreground text-xs">Status</span>
                                    <span className="font-medium text-green-600">Active</span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
