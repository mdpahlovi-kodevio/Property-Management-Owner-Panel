import { useFieldContext } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { Field, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { deleteImage, deleteImages, resolveImage, uploadImages } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Crown, GripVertical, Trash2, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

// ─── Data Structure ───────────────────────────────────────────────
export type GalleryImage = {
    url: string
    thumbnail: boolean
    sortOrder: number
}

// ─── Props ────────────────────────────────────────────────────────
type FormGalleryProps = {
    folder?: string
    disabled?: boolean
    accept?: string
    maxFiles?: number
}

// ─── Main Component ───────────────────────────────────────────────
export function FormGallery({ folder, disabled, accept = 'image/png,image/jpeg,image/jpg,image/webp', maxFiles = 10 }: FormGalleryProps) {
    const field = useFieldContext<GalleryImage[]>()
    const inputRef = useRef<HTMLInputElement>(null)
    const [isUploading, startUpload] = useTransition()
    const [isDeleting, startDelete] = useTransition()
    const [isDragOver, setIsDragOver] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    const images = field.state.value ?? []
    const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder)
    const hasThumbnail = images.some((img) => img.thumbnail)

    // ─── Helpers ──────────────────────────────────────────────────
    const getNextSortOrder = useCallback(() => {
        if (images.length === 0) return 0
        return Math.max(...images.map((img) => img.sortOrder)) + 1
    }, [images])

    // ─── Upload ───────────────────────────────────────────────────
    const processFiles = (files: File[]) => {
        const remaining = maxFiles - images.length
        if (remaining <= 0) {
            toast.error(`Maximum ${maxFiles} images allowed`)
            return
        }

        const filesToUpload = files.slice(0, remaining)
        if (filesToUpload.length < files.length) {
            toast.warning(`Only ${remaining} more image${remaining > 1 ? 's' : ''} can be added`)
        }

        startUpload(async () => {
            try {
                const urls = await uploadImages(filesToUpload, folder)
                const baseSortOrder = getNextSortOrder()
                const newImages: GalleryImage[] = urls.map((url, i) => ({
                    url,
                    thumbnail: false,
                    sortOrder: baseSortOrder + i,
                }))

                if (newImages.length > 0) {
                    const updated = [...images, ...newImages]
                    // Auto-assign first image as thumbnail if none exists
                    if (!updated.some((img) => img.thumbnail)) {
                        updated[0] = { ...updated[0], thumbnail: true }
                    }
                    field.handleChange(updated)
                    toast.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} uploaded`)
                }
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Upload failed')
            }
        })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        e.target.value = ''

        if (!files.length) return
        processFiles(files)
    }

    // ─── Delete ───────────────────────────────────────────────────
    const handleDelete = (imageUrl: string) => {
        const image = images.find((img) => img.url === imageUrl)
        if (!image) return

        startDelete(async () => {
            try {
                await deleteImage(imageUrl)
                const remaining = images.filter((img) => img.url !== imageUrl).map((img, i) => ({ ...img, sortOrder: i }))

                // Reassign thumbnail if the deleted one was it
                if (image.thumbnail && remaining.length > 0) {
                    remaining[0] = { ...remaining[0], thumbnail: true }
                }

                field.handleChange(remaining)
                toast.success('Image removed')
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Delete failed')
            }
        })
    }

    const handleClearAll = () => {
        if (images.length === 0) return

        startDelete(async () => {
            try {
                await deleteImages(images.map((img) => img.url))
                field.handleChange([])
                toast.success('All images removed')
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to clear images')
            }
        })
    }

    // ─── Thumbnail ────────────────────────────────────────────────
    const handleSetThumbnail = (imageUrl: string) => {
        const current = images.find((img) => img.thumbnail)
        if (current?.url === imageUrl) return // already thumbnail

        const updated = images.map((img) => ({
            ...img,
            thumbnail: img.url === imageUrl,
        }))
        field.handleChange(updated)
    }

    // ─── Drag Reorder ─────────────────────────────────────────────
    const handleDragStart = (index: number) => setDraggedIndex(index)

    const handleDragOverCard = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        setDragOverIndex(index)
    }

    const handleDropCard = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null)
            setDragOverIndex(null)
            return
        }

        const reordered = [...sortedImages]
        const [moved] = reordered.splice(draggedIndex, 1)
        reordered.splice(dropIndex, 0, moved)

        field.handleChange(reordered.map((img, i) => ({ ...img, sortOrder: i })))
        setDraggedIndex(null)
        setDragOverIndex(null)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
        setDragOverIndex(null)
    }

    // ─── File Drop Zone ───────────────────────────────────────────
    const handleZoneDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleZoneDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleZoneDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
        if (files.length > 0) {
            processFiles(files)
        } else {
            toast.error('Please drop image files only')
        }
    }

    // ─── Render ───────────────────────────────────────────────────
    return (
        <Field data-invalid={isInvalid}>
            <input
                ref={inputRef}
                id={field.name}
                name={field.name}
                type="file"
                accept={accept}
                multiple
                onBlur={field.handleBlur}
                onChange={handleFileChange}
                aria-invalid={isInvalid}
                className="sr-only"
                disabled={disabled || isUploading}
            />

            {/* ── Upload Zone ─────────────────────────────────────── */}
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={handleZoneDragOver}
                onDragLeave={handleZoneDragLeave}
                onDrop={handleZoneDrop}
                className={cn(
                    'flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300',
                    'border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10',
                    isDragOver && 'border-primary bg-primary/15 scale-[1.01] shadow-lg shadow-primary/10',
                    (disabled || isUploading) && 'cursor-not-allowed opacity-60 pointer-events-none',
                )}
                disabled={disabled || isUploading}
            >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300">
                    {isUploading ? <Spinner /> : <Upload className="h-5 w-5 text-primary" />}
                </div>
                <p className="text-sm font-medium">
                    Drop images here or <span className="text-primary underline underline-offset-2">Browse</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP &middot; Max {maxFiles} images</p>
            </button>

            {/* ── Image Grid ──────────────────────────────────────── */}
            {images.length > 0 && (
                <div className="mt-4 space-y-3">
                    {/* Stats bar */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                                {images.length} image{images.length !== 1 ? 's' : ''}
                            </span>
                            {hasThumbnail && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-500">
                                    <Crown className="h-3 w-3" /> Thumbnail set
                                </span>
                            )}
                        </div>
                        <Button size="sm" variant="destructive" onClick={handleClearAll} disabled={disabled || isDeleting || isUploading}>
                            {isDeleting ? <Spinner /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
                            Clear All
                        </Button>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {sortedImages.map((img, index) => (
                            <ImageCard
                                key={img.url}
                                image={img}
                                previewUrl={resolveImage(img.url)}
                                disabled={disabled || isDeleting || isUploading}
                                isDragging={draggedIndex === index}
                                isDragOver={dragOverIndex === index}
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOverCard(e, index)}
                                onDrop={(e) => handleDropCard(e, index)}
                                onDragEnd={handleDragEnd}
                                onSetThumbnail={() => handleSetThumbnail(img.url)}
                                onDelete={() => handleDelete(img.url)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}

// ─── Image Card Sub-component ─────────────────────────────────────
type ImageCardProps = {
    image: GalleryImage
    previewUrl: string
    disabled: boolean
    isDragging: boolean
    isDragOver: boolean
    onDragStart: () => void
    onDragOver: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
    onDragEnd: () => void
    onSetThumbnail: () => void
    onDelete: () => void
}

function ImageCard({
    image,
    previewUrl,
    disabled,
    isDragging,
    isDragOver,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onSetThumbnail,
    onDelete,
}: ImageCardProps) {
    return (
        <div
            draggable={!disabled}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            className={cn(
                'group relative aspect-4/3 rounded-xl overflow-hidden border-2 transition-all duration-300',
                'bg-muted/50',
                image.thumbnail
                    ? 'border-amber-500 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500/50'
                    : 'border-border hover:border-primary/60',
                isDragging && 'opacity-40 scale-95',
                isDragOver && 'border-primary scale-[1.03] shadow-lg shadow-primary/20',
            )}
        >
            {/* Image */}
            <img src={previewUrl} alt={image.url} crossOrigin="anonymous" className="h-full w-full object-cover" />

            {/* Gradient overlay on hover */}
            <div
                className={cn(
                    'absolute inset-0 transition-opacity duration-300 pointer-events-none',
                    'bg-linear-to-t from-black/70 via-transparent to-black/30',
                    image.thumbnail ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                )}
            />

            {/* Delete button - visible on hover */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                }}
                disabled={disabled}
                className={cn(
                    'absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full',
                    'bg-black/50 text-white/70 backdrop-blur-sm',
                    'transition-all duration-200 hover:bg-destructive hover:text-white',
                    'opacity-0 group-hover:opacity-100',
                    disabled && 'opacity-0 pointer-events-none',
                )}
                aria-label="Remove image"
            >
                <X className="h-3.5 w-3.5" />
            </button>

            {/* Bottom actions - visible on hover or when thumbnail */}
            <div
                className={cn(
                    'absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-2.5 py-2 transition-opacity duration-300',
                    image.thumbnail ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                )}
            >
                {/* Drag handle */}
                <div
                    className={cn(
                        'flex h-7 w-7 cursor-grab items-center justify-center rounded-lg bg-white/15 text-white/60 backdrop-blur-sm',
                        'transition-all duration-200 hover:bg-white/25 hover:text-white active:cursor-grabbing',
                        disabled && 'pointer-events-none',
                    )}
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                {/* Set thumbnail button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        onSetThumbnail()
                    }}
                    disabled={disabled}
                    className={cn(
                        'flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold backdrop-blur-sm transition-all duration-200',
                        image.thumbnail
                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 hover:bg-amber-400'
                            : 'bg-white/15 text-white/70 hover:bg-amber-500 hover:text-black hover:shadow-md hover:shadow-amber-500/30',
                        disabled && 'pointer-events-none',
                    )}
                    aria-label={image.thumbnail ? 'Current thumbnail' : 'Set as thumbnail'}
                >
                    <Crown className="h-3 w-3" />
                    {image.thumbnail ? 'Active' : 'Set'}
                </button>
            </div>
        </div>
    )
}
