import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { unitBlockApi, type CreateUnitBlockPayload, type UnitBlock } from '@/lib/api'
import type { CalendarUnit } from '@/types/calendar'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import * as z from 'zod'

function todayStr() {
    return new Date().toISOString().split('T')[0]
}

function tomorrowStr() {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
}

const blockSchema = z
    .object({
        unitId: z.string().min(1, 'Select a room'),
        fromDate: z.string().min(1, 'Start date is required'),
        toDate: z.string().min(1, 'End date is required'),
        reason: z.string().optional(),
    })
    .refine((d) => new Date(d.toDate) > new Date(d.fromDate), {
        message: 'End date must be after start date',
        path: ['toDate'],
    })

type BlockFormValues = z.infer<typeof blockSchema>

const defaultValues: BlockFormValues = {
    unitId: '',
    fromDate: todayStr(),
    toDate: tomorrowStr(),
    reason: '',
}

interface BaseProps {
    units: CalendarUnit[]
    onClose: () => void
}

type CreateProps = BaseProps & {
    mode: 'create'
    defaultUnitId?: string
    defaultFromDate?: string
    defaultToDate?: string
}

type EditProps = BaseProps & {
    mode: 'edit'
    block: UnitBlock
}

type BlockDialogProps = CreateProps | EditProps

export function BlockDialog(props: BlockDialogProps) {
    const { units, onClose, mode } = props
    const isEdit = mode === 'edit'
    const block = isEdit ? props.block : null

    const queryClient = useQueryClient()
    const [propertyId, setPropertyId] = useState<string>(block ? (units.find((u) => u.id === block.unitId)?.propertyId ?? '') : '')

    const propertyOptions = useMemo(() => {
        const seen = new Map<string, string>()
        for (const u of units) seen.set(u.propertyId, u.propertyName)
        return Array.from(seen, ([value, label]) => ({ value, label }))
    }, [units])

    const unitOptions = useMemo(() => {
        const filtered = propertyId ? units.filter((u) => u.propertyId === propertyId) : units
        return filtered.map((u) => ({
            value: u.id,
            label: `${u.name}${u.floor ? ` · Floor ${u.floor}` : ''} · ${u.roomTypeName} (${u.propertyName})`,
        }))
    }, [units, propertyId])

    const createMutation = useMutation({
        mutationFn: (payload: CreateUnitBlockPayload) => unitBlockApi.create(payload),
    })

    const updateMutation = useMutation({
        mutationFn: (payload: { id: string; data: Partial<CreateUnitBlockPayload> }) => unitBlockApi.update(payload.id, payload.data),
    })

    const onSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['calendar-snapshot'] })
        queryClient.invalidateQueries({ queryKey: ['calendar-stats'] })
        toast.success(isEdit ? 'Block updated' : 'Maintenance block created')
        onClose()
    }

    const form = useAppForm({
        defaultValues: isEdit
            ? {
                  unitId: block!.unitId,
                  fromDate: block!.fromDate,
                  toDate: block!.toDate,
                  reason: block!.reason ?? '',
              }
            : {
                  ...defaultValues,
                  unitId: props.defaultUnitId ?? '',
                  fromDate: props.defaultFromDate ?? defaultValues.fromDate,
                  toDate: props.defaultToDate ?? defaultValues.toDate,
              },
        validators: { onChange: blockSchema },
        onSubmit: async ({ value }) => {
            try {
                if (isEdit) {
                    await updateMutation.mutateAsync({
                        id: block!.id,
                        data: {
                            fromDate: value.fromDate,
                            toDate: value.toDate,
                            reason: value.reason || undefined,
                        },
                    })
                } else {
                    await createMutation.mutateAsync({
                        unitId: value.unitId,
                        fromDate: value.fromDate,
                        toDate: value.toDate,
                        reason: value.reason || undefined,
                    })
                }
                onSuccess()
            } catch (err) {
                toast.error((err as Error).message || 'Failed to save block')
            }
        },
    })

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wrench className="size-4 text-primary" />
                        {isEdit ? 'Edit Maintenance Block' : 'Create Maintenance Block'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Update the dates or reason for this maintenance block.'
                            : 'Reserve a room for housekeeping, repairs, or any internal use. The room will be marked as out-of-service for the selected dates.'}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                    className="space-y-4"
                >
                    {propertyOptions.length > 1 && !isEdit && (
                        <Field>
                            <FieldLabel htmlFor="property">Property</FieldLabel>
                            <Select
                                value={propertyId}
                                onValueChange={(value) => {
                                    setPropertyId(value)
                                    form.setFieldValue('unitId', '')
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All properties" />
                                </SelectTrigger>
                                <SelectContent>
                                    {propertyOptions.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    )}

                    <form.AppField name="unitId">
                        {(field) => (
                            <field.FormSelect
                                label="Room"
                                placeholder={unitOptions.length ? 'Select a room' : 'No rooms available'}
                                options={unitOptions}
                                disabled={!unitOptions.length || isEdit}
                            />
                        )}
                    </form.AppField>

                    <div className="grid grid-cols-2 gap-3">
                        <form.AppField name="fromDate">{(field) => <field.FormInput type="date" label="From" />}</form.AppField>
                        <form.AppField name="toDate">
                            {(field) => <field.FormInput type="date" label="To" min={form.state.values.fromDate || todayStr()} />}
                        </form.AppField>
                    </div>

                    <form.AppField name="reason">
                        {(field) => (
                            <field.FormTextarea label="Reason (optional)" placeholder="e.g. Deep cleaning, plumbing repair" rows={3} />
                        )}
                    </form.AppField>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} className="px-4">
                            Cancel
                        </Button>
                        <form.AppForm>
                            <form.FormSubmit label={isEdit ? 'Save Changes' : 'Create Block'} />
                        </form.AppForm>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
