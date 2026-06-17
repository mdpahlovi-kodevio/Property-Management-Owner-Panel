import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { authApi, SessionKey } from '@/lib/api/auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

const searchSchema = z.object({
    user: z.email(),
    type: z.enum(['signup', 'reset']),
})

export const Route = createFileRoute('/__auth/verification')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { user, type } = Route.useSearch()
    const [resendDisabled, setResendDisabled] = useState(false)
    const [countdown, setCountdown] = useState(0)

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        } else {
            setResendDisabled(false)
        }
    }, [countdown])

    const verifyOtpSchema = z.object({
        otp: z.string().min(6, t('auth.otp', 'Enter your 6 digit code')),
    })

    const verifySignup = useMutation({
        mutationFn: authApi.verifyEmail,
        onSuccess: (data) => {
            queryClient.setQueryData(SessionKey, data)
            toast.success(t('auth.emailVerified', 'Email verified! Welcome aboard.'))
            navigate({ to: '/' })
        },
        onError: (error) => toast.error(error.message),
    })

    const verifyReset = useMutation({
        mutationFn: authApi.verifyResetOtp,
        onSuccess: (data) => {
            toast.success(t('auth.otpVerified', 'Code verified. Choose a new password.'))
            navigate({ to: '/reset-password', search: { token: data.data.token } })
        },
        onError: (error) => toast.error(error.message),
    })

    const resend = useMutation({
        mutationFn: () =>
            type === 'signup'
                ? authApi.resendVerification({ email: user, panel: 'owner' })
                : authApi.forgotPassword({ email: user, panel: 'owner' }),
        onSuccess: () => {
            toast.success(t('auth.codeSent', 'A new code has been sent to your email.'))
            setResendDisabled(true)
            setCountdown(60)
        },
        onError: () => toast.error(t('auth.failedToResend', 'Failed to resend code. Please try again.')),
    })

    const form = useAppForm({
        defaultValues: { otp: '' },
        validators: { onChange: verifyOtpSchema },
        onSubmit: async ({ value }) => {
            const payload = { email: user, panel: 'owner' as const, otp: value.otp }
            if (type === 'signup') {
                await verifySignup.mutateAsync(payload)
            } else {
                await verifyReset.mutateAsync(payload)
            }
        },
    })

    return (
        <div className="my-16 mx-auto flex w-full max-w-114 flex-col gap-6 rounded-lg border p-6 bg-white">
            <div className="text-center grid gap-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold">{t('auth.enterCode', 'Enter verification code')}</h2>
                <p className="text-sm text-muted-foreground">{t('auth.weSentCode', "We've sent a 6-digit code to")}</p>
                <p className="font-medium text-foreground">{user}</p>
            </div>

            <form
                className="grid gap-6"
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
            >
                <form.AppField name="otp">{(field) => <field.FormInputOtp />}</form.AppField>

                <form.AppForm>
                    <form.FormSubmit label={t('auth.verify', 'Verify')} />
                </form.AppForm>
            </form>

            <p className="text-center text-sm text-muted-foreground">
                {t('auth.didntReceiveCode', "Didn't receive the code?")}{' '}
                <button
                    onClick={() => resend.mutate()}
                    disabled={resendDisabled}
                    className="font-medium text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                >
                    {resend.isPending
                        ? t('auth.sending', 'Sending...')
                        : resendDisabled && countdown > 0
                          ? t('auth.resendIn', 'Resend in {{countdown}}s', { countdown })
                          : t('auth.resend', 'Resend code')}
                </button>
            </p>

            <Button asChild variant="outline">
                <Link to="/signin">{t('auth.backToSignIn', 'Back to Sign In')}</Link>
            </Button>
        </div>
    )
}
