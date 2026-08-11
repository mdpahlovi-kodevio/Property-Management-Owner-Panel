import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { GuestSupportMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import { ChevronLeft, LockKeyhole, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type ConversationThreadProps = {
    title: string
    subtitle?: string
    currentUserId: string
    messages: GuestSupportMessage[]
    isLoading?: boolean
    hasOlderMessages?: boolean
    isLoadingOlder?: boolean
    isSending?: boolean
    canReply?: boolean
    emptyText?: string
    onBack?: () => void
    onLoadOlder?: () => Promise<unknown>
    onSend: (message: string) => void
}

const getInitials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

export function ConversationThread({
    title,
    subtitle,
    currentUserId,
    messages,
    isLoading,
    hasOlderMessages,
    isLoadingOlder,
    isSending,
    canReply = true,
    emptyText = 'No messages yet',
    onBack,
    onLoadOlder,
    onSend,
}: ConversationThreadProps) {
    const [draft, setDraft] = useState('')
    const scrollRef = useRef<HTMLDivElement>(null)
    const previousScrollHeightRef = useRef(0)
    const initializedForTitleRef = useRef<string | null>(null)

    useEffect(() => {
        const container = scrollRef.current
        if (!container || isLoading || messages.length === 0) return

        if (initializedForTitleRef.current !== title) {
            initializedForTitleRef.current = title
            container.scrollTop = container.scrollHeight
            return
        }

        if (previousScrollHeightRef.current > 0) {
            container.scrollTop += container.scrollHeight - previousScrollHeightRef.current
            previousScrollHeightRef.current = 0
        }
    }, [isLoading, messages.length, title])

    const handleScroll = () => {
        const container = scrollRef.current
        if (!container || container.scrollTop >= 80 || !hasOlderMessages || isLoadingOlder || !onLoadOlder) return
        previousScrollHeightRef.current = container.scrollHeight
        void onLoadOlder()
    }

    const submit = () => {
        const message = draft.trim()
        if (!message || isSending || !canReply) return
        onSend(message)
        setDraft('')
    }

    return (
        <div className="flex h-full min-h-0 flex-col bg-background">
            <header className="flex shrink-0 items-center gap-3 border-b bg-card/90 px-4 py-4 backdrop-blur">
                {onBack && (
                    <Button type="button" variant="ghost" size="icon-sm" onClick={onBack} aria-label="Back to conversations">
                        <ChevronLeft className="size-4.5" />
                    </Button>
                )}
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {getInitials(title)}
                </div>
                <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{title}</h3>
                    {subtitle && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{subtitle}</p>}
                </div>
            </header>

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="min-h-0 flex-1 space-y-3 overscroll-contain overflow-y-auto bg-muted/20 p-5"
            >
                {isLoading ? (
                    <div className="grid h-full place-items-center">
                        <Spinner />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="grid h-full place-items-center px-8 text-center text-sm text-muted-foreground">{emptyText}</div>
                ) : (
                    <>
                        {hasOlderMessages && (
                            <div className="flex h-8 items-center justify-center text-[11px] text-muted-foreground">
                                {isLoadingOlder ? <Spinner className="size-4" /> : 'Scroll up for older messages'}
                            </div>
                        )}
                        {messages.map((message) => {
                            const fromCurrentUser = message.senderUserId === currentUserId
                            return (
                                <div key={message.id} className={cn('flex gap-2.5', fromCurrentUser ? 'justify-end' : 'justify-start')}>
                                    {!fromCurrentUser && (
                                        <Avatar size="sm" className="mt-auto shrink-0">
                                            {message.sender.image && <AvatarImage src={message.sender.image} alt="" />}
                                            <AvatarFallback className="text-[10px]">{getInitials(message.sender.name)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn('max-w-[82%]', fromCurrentUser ? 'text-right' : 'text-left')}>
                                        {!fromCurrentUser && (
                                            <p className="mb-1 ml-1 text-[10px] font-semibold text-muted-foreground">
                                                {message.sender.name}
                                            </p>
                                        )}
                                        <div
                                            className={cn(
                                                'rounded-2xl px-3.5 py-2.5 text-left text-[13px] leading-relaxed shadow-sm',
                                                fromCurrentUser
                                                    ? 'rounded-br-sm bg-primary text-primary-foreground'
                                                    : 'rounded-bl-sm border bg-card text-foreground',
                                            )}
                                        >
                                            <p className="whitespace-pre-wrap break-words">{message.message}</p>
                                        </div>
                                        <p className="mt-1 px-1 text-[10px] text-muted-foreground">
                                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </>
                )}
            </div>

            <footer className="shrink-0 border-t bg-card p-3">
                {canReply ? (
                    <div className="flex items-end gap-2 rounded-xl border bg-background p-1.5 focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-primary/10">
                        <textarea
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault()
                                    submit()
                                }
                            }}
                            rows={1}
                            placeholder="Write a message..."
                            aria-label="Message"
                            className="max-h-24 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
                        />
                        <Button
                            type="button"
                            size="icon"
                            className="size-9 rounded-lg"
                            onClick={submit}
                            disabled={!draft.trim() || isSending}
                            aria-label="Send message"
                        >
                            {isSending ? <Spinner /> : <Send className="size-4" />}
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                        <LockKeyhole className="size-3.5" />
                        Conversation is read-only
                    </div>
                )}
            </footer>
        </div>
    )
}
