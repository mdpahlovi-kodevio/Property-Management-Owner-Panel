import { useAppForm } from '@/components/form/form-context'
import { authApi } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

export const Route = createFileRoute('/__auth/forgot-password')({
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const forgotSchema = z.object({
        email: z.email(t('auth.enterEmail', 'Enter your email address')),
    })

    const forgot = useMutation({
        mutationFn: authApi.forgotPassword,
        onSuccess: () => {
            toast.success(t('auth.codeSent', 'A new code has been sent to your email.'))
            navigate({ to: '/verification', search: { user: form.state.values.email, type: 'reset' } })
        },
        onError: (error) => toast.error(error.message),
    })

    const form = useAppForm({
        defaultValues: { email: '' },
        validators: { onChange: forgotSchema },
        onSubmit: async ({ value }) => {
            await forgot.mutateAsync({
                email: value.email,
                panel: 'owner',
            })
        },
    })

    return (
        <div className="my-16 mx-auto flex w-full max-w-150 flex-col gap-6 rounded-lg border p-6 bg-white">
            <div>
                <h2 className="text-center text-2xl font-bold">{t('auth.forgotPassword', 'Forgot Password')}</h2>
                <p
                    className="mt-2 text-center text-muted-foreground"
                    dangerouslySetInnerHTML={{
                        __html: t(
                            'auth.forgotPasswordDesc',
                            'Enter your registered email address and we’ll send you a <br /> verification code to reset your password.',
                        ),
                    }}
                />
            </div>

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

                <form.AppForm>
                    <form.FormSubmit label={t('auth.sendCode', 'Send verification code')} />
                </form.AppForm>
            </form>

            <p className="text-center text-muted-foreground">
                {t('auth.rememberPassword', 'Remember your password?')}{' '}
                <Link to="/signin" className="text-foreground font-medium hover:underline">
                    {t('auth.signIn', 'Sign in')}
                </Link>
            </p>
        </div>
    )
}
