import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Clock, Filter, MessageSquare, Star } from 'lucide-react'
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

  const filteredReviews = useMemo(() => {
    return MOCK_REVIEWS.filter((review) => {
      const matchesSearch =
        review.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.text.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [searchQuery])

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Guest Reviews" description="Monitor and respond to guest feedback across all channels." className="mb-0" />
        <Button>
          Generate Insights Report
        </Button>
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
          filteredReviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </div>
    </>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5 sm:p-6 flex flex-col gap-5 transition-all duration-200 hover:shadow-md hover:border-border group">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex items-start gap-4">
          <img
            src={review.avatarUrl}
            alt={review.guestName}
            className="w-12 h-12 rounded-full border-2 border-background shadow-sm object-cover shrink-0"
          />
          <div>
            <h3 className="font-semibold text-foreground text-lg leading-tight mb-1">{review.guestName}</h3>
            <p className="text-sm text-muted-foreground">
              Stayed at <span className="font-medium text-foreground">{review.property}</span> • {review.date}
            </p>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 sm:gap-2 border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
          <div className="flex items-center bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
            <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mr-3">
              {review.platform}
            </span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'
                    }`}
                />
              ))}
            </div>
          </div>
          {review.status === 'Replied' ? (
            <span className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Replied
            </span>
          ) : (
            <span className="flex items-center text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 mr-1.5" /> Pending Reply
            </span>
          )}
        </div>
      </div>

      <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
        <p className="text-foreground/90 leading-relaxed text-[15px]">"{review.text}"</p>
      </div>

      {review.status === 'Replied' && review.replyText && (
        <div className="ml-4 sm:ml-12 bg-muted/50 rounded-xl p-4 sm:p-5 border border-border/60 relative">
          <div className="absolute -top-2 left-6 w-4 h-4 bg-muted/50 border-t border-l border-border/60 transform rotate-45"></div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-semibold text-sm text-primary flex items-center">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
              </div>
              Host Reply
            </span>
            <span className="text-xs font-medium text-muted-foreground">Oct 25, 2026</span>
          </div>
          <p className="text-[15px] text-muted-foreground leading-relaxed ml-8">{review.replyText}</p>
        </div>
      )}

      {review.status === 'Pending' && (
        <div className="ml-4 sm:ml-12 mt-1 flex gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button className="rounded-lg px-6 h-10 text-sm shadow-sm transition-all">
            Write a Reply
          </Button>
          <Button variant="outline" className="rounded-lg h-10 text-sm transition-all">
            Use Template
          </Button>
        </div>
      )}
    </div>
  )
}
