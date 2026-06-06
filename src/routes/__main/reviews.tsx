import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { Textarea } from '@/components/ui/textarea'
import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Clock, Filter, MessageSquare, Star, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/__main/reviews')({
  component: RouteComponent,
})

type Review = {
  id: string
  guestName: string
  property: string
  date: string
  rating: number
  platform: 'Airbnb' | 'Booking.com' | 'Direct' | 'Expedia'
  text: string
  status: 'Replied' | 'Pending'
  replyText?: string
  avatarUrl: string
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 'REV-001',
    guestName: 'Eleanor Pena',
    property: 'Sunset Paradise Resort',
    date: 'Oct 24, 2026',
    rating: 5,
    platform: 'Airbnb',
    text: 'Absolutely wonderful stay! The view from the balcony was breathtaking and the staff was incredibly accommodating. We loved the welcome basket and the seamless check-in process.',
    status: 'Pending',
    avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Eleanor&backgroundColor=f1f5f9',
  },
  {
    id: 'REV-002',
    guestName: 'Guy Hawkins',
    property: 'Ocean Breeze Villa',
    date: 'Oct 22, 2026',
    rating: 4,
    platform: 'Booking.com',
    text: 'Great location and very clean. The Wi-Fi was a bit spotty in the evenings, but otherwise a fantastic experience. Would recommend to friends visiting the area.',
    status: 'Replied',
    replyText:
      'Dear Guy, thank you for your kind words! We apologize for the Wi-Fi issues and are currently upgrading our routers to ensure a seamless connection for future guests. We hope to host you again!',
    avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Guy&backgroundColor=f1f5f9',
  },
  {
    id: 'REV-003',
    guestName: 'Jenny Wilson',
    property: 'Coral Bay Residence',
    date: 'Oct 20, 2026',
    rating: 5,
    platform: 'Direct',
    text: 'The best vacation rental we have ever booked. Everything was spotless, the kitchen was fully equipped, and the host responded within minutes to our queries.',
    status: 'Replied',
    replyText: 'Thank you Jenny! It was a pleasure hosting you. We always strive to provide a 5-star experience, and we hope to welcome you back to Coral Bay soon.',
    avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jenny&backgroundColor=f1f5f9',
  },
  {
    id: 'REV-004',
    guestName: 'Robert Fox',
    property: 'Palm Horizon Retreat',
    date: 'Oct 18, 2026',
    rating: 3,
    platform: 'Expedia',
    text: 'The property was okay, but the air conditioning in the master bedroom was noisy. Also, the pool was smaller than it looked in the photos.',
    status: 'Pending',
    avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Robert&backgroundColor=f1f5f9',
  },
  {
    id: 'REV-005',
    guestName: 'Esther Howard',
    property: 'Sunset Paradise Resort',
    date: 'Oct 15, 2026',
    rating: 5,
    platform: 'Airbnb',
    text: 'A hidden gem! Watching the sunset from the private deck is a memory I will cherish forever. Worth every penny.',
    status: 'Replied',
    replyText: 'Hi Esther, we are thrilled you enjoyed the sunsets as much as we do! Thank you for choosing our resort for your getaway.',
    avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Esther&backgroundColor=f1f5f9',
  },
]

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS)

  const handleReply = (id: string, text: string) => {
    setReviews(prev => prev.map(review =>
      review.id === id
        ? { ...review, status: 'Replied', replyText: text }
        : review
    ))
  }

  const handleDelete = (id: string) => {
    setReviews(prev => prev.filter(review => review.id !== id))
  }

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch =
        review.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.text.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [searchQuery, reviews])

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Guest Reviews" description="Monitor and respond to guest feedback across all channels." className="mb-0" />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SearchInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Search reviews..."
            className="w-full sm:w-64"
          />
          <Button variant="outline" className="h-10 px-4">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="flex flex-col gap-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground">No reviews found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          filteredReviews.map((review) => <ReviewCard key={review.id} review={review} onReply={handleReply} onDelete={handleDelete} />)
        )}
      </div>
    </>
  )
}

function ReviewCard({ review, onReply, onDelete }: { review: Review, onReply: (id: string, text: string) => void, onDelete: (id: string) => void }) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onReply(review.id, replyText.trim())
      setIsReplying(false)
      setReplyText('')
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-5 transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <img
            src={review.avatarUrl}
            alt={review.guestName}
            className="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-border/50"
          />
          <div className="flex flex-col gap-0.5">
            <h3 className="font-semibold text-foreground text-[16px]">{review.guestName}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] text-muted-foreground">{review.date}</span>
              <div className="w-1 h-1 rounded-full bg-border hidden sm:block"></div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#FFF8F0] text-[#D97706] rounded font-medium text-[11px] sm:text-[12px] border border-[#FDE6D5]">
                <div className="relative flex items-center justify-center">
                  <MessageSquare className="w-[12px] h-[12px]" />
                  <Star className="w-[6px] h-[6px] absolute fill-[#D97706] mb-[2px] ml-[1px]" />
                </div>
                For {review.property}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="flex flex-col sm:items-end gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-[18px] h-[18px] ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {review.status === 'Replied' ? (
                <span className="flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Replied
                </span>
              ) : (
                <span className="flex items-center text-[11px] font-semibold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3 mr-1" /> Pending
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onDelete(review.id)}
            className="text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors p-2 rounded-md cursor-pointer sm:-mr-2"
            title="Delete review"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Review Content */}
      <p className="text-foreground/90 leading-relaxed text-[15px]">
        "{review.text}"
      </p>

      {/* Host Reply Box */}
      {review.status === 'Replied' && review.replyText && (
        <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">Host Reply</span>
          </div>
          <p className="text-[14px] text-muted-foreground leading-relaxed pl-6">{review.replyText}</p>
        </div>
      )}

      {/* Action Area */}
      {review.status === 'Pending' && !isReplying && (
        <div className="flex gap-3 pt-1">
          <Button
            className="rounded-lg px-6 h-10 text-sm shadow-sm transition-all cursor-pointer"
            onClick={() => setIsReplying(true)}
          >
            Write a Reply
          </Button>
          <Button variant="outline" className="rounded-lg h-10 text-sm transition-all cursor-pointer">
            Use Template
          </Button>
        </div>
      )}

      {/* Reply Form */}
      {review.status === 'Pending' && isReplying && (
        <div className="flex flex-col gap-3 pt-1">
          <div className="relative">
            <Textarea
              placeholder="Type your reply here..."
              className="min-h-[100px] resize-none pr-10 bg-background"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full cursor-pointer hover:bg-muted"
              onClick={() => {
                setIsReplying(false)
                setReplyText('')
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsReplying(false)
                setReplyText('')
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitReply}
              disabled={!replyText.trim()}
              className="cursor-pointer"
            >
              Send Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
