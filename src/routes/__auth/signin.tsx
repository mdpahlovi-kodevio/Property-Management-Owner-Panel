import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import type { SignInPayload } from '@/lib/api'
import { authApi, SessionKey } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

export const Route = createFileRoute('/__auth/signin')({
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // ── MFA step state ────────────────────────────────────────────────
    const [mfaToken, setMfaToken] = useState<string | null>(null)

    const signinSchema = z.object({
        email: z.email(t('auth.enterEmail', 'Enter your email address')),
        password: z
            .string()
            .min(8, t('auth.passwordMin', 'Password must be at least 8 characters'))
            .max(32, t('auth.passwordMax', 'Password must be at most 32 characters')),
    })

    const signIn = useMutation({
        mutationFn: (payload: SignInPayload) => authApi.signIn(payload),
        onSuccess: (result) => {
            if ('requiresMfa' in result.data) {
                // MFA challenge required
                setMfaToken(result.data.mfaToken)
            } else {
                queryClient.setQueryData(SessionKey, result.data)
                if (!result.data.user.emailVerified) {
                    navigate({ to: '/verification', search: { user: result.data.user.email, type: 'signup' } })
                } else {
                    navigate({ to: '/' })
                }
            }
        },
        onError: (error) => toast.error(error.message),
    })

    const verifyMfa = useMutation({
        mutationFn: (payload: { mfaToken: string; code: string }) => authApi.mfaVerify(payload),
        onSuccess: (data) => {
            queryClient.setQueryData(SessionKey, data)
            if (!data.user.emailVerified) {
                navigate({ to: '/verification', search: { user: data.user.email, type: 'signup' } })
            } else {
                navigate({ to: '/' })
            }
        },
        onError: (error) => toast.error(error.message),
    })

    const form = useAppForm({
        defaultValues: { email: '', password: '' },
        validators: { onChange: signinSchema },
        onSubmit: async ({ value }) => {
            await signIn.mutateAsync({
                email: value.email,
                panel: 'owner',
                password: value.password,
            })
        },
    })

    const mfaSchema = z.object({
        code: z
            .string()
            .regex(/^\d{6}$/, t('auth.mfa.invalidCode', 'Enter a valid 6-digit code'))
            .length(6, t('auth.mfa.invalidCode', 'Enter a valid 6-digit code')),
    })

    const formMfa = useAppForm({
        defaultValues: { code: '' },
        validators: { onChange: mfaSchema },
        onSubmit: async ({ value }) => {
            if (mfaToken) {
                await verifyMfa.mutateAsync({ mfaToken, code: value.code })
            }
        },
    })

    // ── MFA challenge screen ──────────────────────────────────────────
    if (mfaToken) {
        return (
            <div className="my-16 mx-auto flex w-full max-w-150 flex-col gap-6 rounded-lg border p-6 bg-white">
                <div>
                    <h2 className="text-center text-2xl font-bold">{t('auth.mfa.title', 'Two-Factor Authentication')}</h2>
                    <p className="mt-2 text-center text-muted-foreground">
                        {t('auth.mfa.description', 'Enter the 6-digit code from your authenticator app.')}
                    </p>
                </div>

                <form
                    className="grid gap-6"
                    onSubmit={(e) => {
                        e.preventDefault()
                        formMfa.handleSubmit()
                    }}
                >
                    <formMfa.AppField name="code">
                        {(field) => <field.FormInputOtp label={t('auth.mfa.code', 'Verification Code')} disabled={verifyMfa.isPending} />}
                    </formMfa.AppField>

                    <formMfa.AppForm>
                        <formMfa.FormSubmit
                            label={verifyMfa.isPending ? t('auth.mfa.verifying', 'Verifying...') : t('auth.mfa.verify', 'Verify')}
                        />
                    </formMfa.AppForm>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            // Reset MFA state — using a <Link to="/signin"> here would not
                            // unmount this component, leaving the user stuck on the challenge screen.
                            setMfaToken(null)
                            formMfa.reset()
                        }}
                    >
                        {t('auth.backToSignIn', 'Back to Sign In')}
                    </Button>
                </form>
            </div>
        )
    }

    // ── Default sign-in form ──────────────────────────────────────────
    return (
        <div className="my-16 mx-auto flex w-full max-w-150 flex-col gap-6 rounded-lg border p-6 bg-white">
            <h2 className="text-center text-2xl font-bold">{t('auth.signIn', 'Sign In')}</h2>

            <form
                className="grid gap-6"
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
            >
                <form.AppField name="email">
                    {(field) => (
                        <field.FormInput
                            type="email"
                            label={t('auth.email', 'Email')}
                            placeholder={t('auth.enterEmail', 'Enter your email')}
                        />
                    )}
                </form.AppField>

                <form.AppField name="password">
                    {(field) => (
                        <field.FormInput
                            type="password"
                            label={t('auth.password', 'Password')}
                            placeholder={t('auth.enterPassword', 'Enter your password')}
                        />
                    )}
                </form.AppField>

                <div className="flex items-center justify-end">
                    <Link to="/forgot-password" className="text-primary font-medium hover:underline">
                        {t('auth.forgotPasswordText', 'Forgot password?')}
                    </Link>
                </div>

                <form.AppForm>
                    <form.FormSubmit label={t('auth.signIn', 'Sign In')} />
                </form.AppForm>
            </form>
        </div>
    )
}
