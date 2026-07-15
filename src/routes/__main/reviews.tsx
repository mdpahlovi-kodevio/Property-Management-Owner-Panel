import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { reviewApi, type Review, type ReviewStats } from '@/lib/api'
import { GetProperties } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Eye, EyeOff, MessageSquare, Search, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/__main/reviews')({
    component: RouteComponent,
})

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
                    style={{ width: size, height: size }}
                />
            ))}
        </div>
    )
}

function RouteComponent() {
    const properties = GetProperties()
    const queryClient = useQueryClient()

    const [search, setSearch] = useState('')
    const [propertyId, setPropertyId] = useState('all')
    const [ratingFilter, setRatingFilter] = useState<string>('all')

    const reviewsQuery = useQuery({
        queryKey: ['owner-reviews', search, propertyId, ratingFilter],
        queryFn: () =>
            reviewApi.list({
                page: 1,
                limit: 50,
                ...(propertyId !== 'all' && { propertyId }),
                ...(ratingFilter !== 'all' && { rating: Number(ratingFilter) }),
                ...(search && { search }),
            }),
    })

    const statsQuery = useQuery({
        queryKey: ['owner-review-stats', propertyId],
        queryFn: () => reviewApi.stats(propertyId !== 'all' ? { propertyId } : undefined),
    })

    const visibilityMutation = useMutation({
        mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) => reviewApi.setVisibility(id, isPublic),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['owner-reviews'] })
            queryClient.invalidateQueries({ queryKey: ['owner-review-stats'] })
            toast.success(vars.isPublic ? 'Review published' : 'Review hidden')
        },
        onError: (err: Error) => toast.error(err.message),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => reviewApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['owner-reviews'] })
            queryClient.invalidateQueries({ queryKey: ['owner-review-stats'] })
            toast.success('Review deleted')
        },
        onError: (err: Error) => toast.error(err.message),
    })

    const reviews = reviewsQuery.data?.data ?? []
    const stats: ReviewStats = statsQuery.data?.data ?? {
        totalReviews: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        totalProperties: 0,
    }

    return (
        <>
            <PageHeader title="Guest Reviews" description="Monitor and respond to guest feedback across all properties." />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="pt-5">
                    <CardContent>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Average Rating</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">/ 5</span>
                        </div>
                        <div className="mt-1">
                            <StarRow rating={Math.round(stats.averageRating)} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="pt-5">
                    <CardContent>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Reviews</p>
                        <p className="mt-2 text-3xl font-bold">{stats.totalReviews}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Across {stats.totalProperties} {stats.totalProperties === 1 ? 'property' : 'properties'}
                        </p>
                    </CardContent>
                </Card>
                <Card className="pt-5">
                    <CardContent>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Rating Distribution</p>
                        <div className="mt-2 space-y-1">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = stats.distribution[star as 1 | 2 | 3 | 4 | 5]
                                const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                                return (
                                    <div key={star} className="flex items-center gap-2 text-xs">
                                        <span className="w-3 text-muted-foreground">{star}</span>
                                        <Star className="size-3 text-amber-400 fill-amber-400" />
                                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="w-6 text-right text-muted-foreground">{count}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search reviews..."
                        className="w-full pl-9 pr-3 h-10 rounded-md border border-input bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>
                <Select value={propertyId} onValueChange={setPropertyId}>
                    <SelectTrigger className="sm:w-48">
                        <SelectValue placeholder="All properties" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All properties</SelectItem>
                        {properties.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="sm:w-36">
                        <SelectValue placeholder="All ratings" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All ratings</SelectItem>
                        {[5, 4, 3, 2, 1].map((r) => (
                            <SelectItem key={r} value={String(r)}>
                                {r} stars
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Reviews list */}
            {reviewsQuery.isLoading ? (
                <div className="flex justify-center py-16">
                    <Spinner />
                </div>
            ) : reviewsQuery.isError ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        Failed to load reviews. {(reviewsQuery.error as Error)?.message}
                    </CardContent>
                </Card>
            ) : reviews.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <MessageSquare className="w-12 h-12 text-muted-foreground" />
                        <h3 className="text-lg font-medium">No reviews found</h3>
                        <p className="text-sm text-muted-foreground">Reviews will appear here after guests check out and leave a rating.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col gap-4">
                    {reviews.map((r) => (
                        <ReviewCard
                            key={r.id}
                            review={r}
                            onToggleVisibility={(isPublic) => visibilityMutation.mutate({ id: r.id, isPublic })}
                            onDelete={() => {
                                if (window.confirm('Delete this review? This action cannot be undone.')) {
                                    deleteMutation.mutate(r.id)
                                }
                            }}
                            toggling={visibilityMutation.isPending && visibilityMutation.variables?.id === r.id}
                            deleting={deleteMutation.isPending && deleteMutation.variables === r.id}
                        />
                    ))}
                </div>
            )}
        </>
    )
}

function ReviewCard({
    review,
    onToggleVisibility,
    onDelete,
    toggling,
    deleting,
}: {
    review: Review
    onToggleVisibility: (isPublic: boolean) => void
    onDelete: () => void
    toggling: boolean
    deleting: boolean
}) {
    const guestName = review.guest.user.name
    const avatarSrc = review.guest.user.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(guestName)}`

    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <img src={avatarSrc} alt={guestName} className="size-12 rounded-full object-cover ring-1 ring-border/50 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h3 className="font-semibold">{guestName}</h3>
                            <StarRow rating={review.rating} />
                            {!review.isPublic && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    HIDDEN
                                </span>
                            )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDate(review.createdAt)}</span>
                            <span className="size-1 rounded-full bg-border" />
                            <span>{review.property.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => onToggleVisibility(!review.isPublic)}
                            disabled={toggling}
                            title={review.isPublic ? 'Hide from public' : 'Publish'}
                        >
                            {review.isPublic ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-red-600"
                            onClick={onDelete}
                            disabled={deleting}
                            title="Delete review"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>

                {review.title && <p className="font-semibold text-foreground">{review.title}</p>}
                <p className="text-foreground/90 leading-relaxed text-[15px]">"{review.comment}"</p>
            </CardContent>
        </Card>
    )
}
