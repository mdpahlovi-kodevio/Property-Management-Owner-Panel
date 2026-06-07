import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createFileRoute } from '@tanstack/react-router'
import { Filter, MessageSquare, Star, Trash2 } from 'lucide-react'
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
    avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Esther&backgroundColor=f1f5f9',
  },
]

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus] = useState<string>('All')
  const [filterPlatform, setFilterPlatform] = useState<string>('All')
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
      const matchesPlatform = filterPlatform === 'All' || review.platform === filterPlatform
      return matchesSearch && matchesPlatform
    })
  }, [searchQuery, reviews, filterPlatform])

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 px-4">
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {(filterStatus !== 'All' || filterPlatform !== 'All') && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {(filterStatus !== 'All' ? 1 : 0) + (filterPlatform !== 'All' ? 1 : 0)}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Platform</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={filterPlatform} onValueChange={setFilterPlatform}>
                <DropdownMenuRadioItem value="All">All Platforms</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Airbnb">Airbnb</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Booking.com">Booking.com</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Direct">Direct</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Expedia">Expedia</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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

function ReviewCard({ review, onDelete }: { review: Review, onReply: (id: string, text: string) => void, onDelete: (id: string) => void }) {

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
    </div>
  )
}
