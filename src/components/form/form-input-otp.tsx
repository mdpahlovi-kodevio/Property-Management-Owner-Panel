import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useFieldContext } from './form-context'

type FormInputOtpProps = {
    label: string
    disabled?: boolean
}

export function FormInputOtp({ label, disabled }: FormInputOtpProps) {
    const field = useFieldContext<string>()
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <InputOTP maxLength={6} value={field.state.value} onChange={(value) => field.handleChange(value)} disabled={disabled}>
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            </InputOTP>
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}
