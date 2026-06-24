import { useAppForm } from '@/components/form/form-context'
import type { SignInPayload } from '@/lib/api'
import { authApi, SessionKey } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
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

    const signinSchema = z.object({
        email: z.email(t('auth.enterEmail', 'Enter your email address')),
        password: z
            .string()
            .min(8, t('auth.passwordMin', 'Password must be at least 8 characters'))
            .max(32, t('auth.passwordMax', 'Password must be at most 32 characters')),
    })

    const signIn = useMutation({
        mutationFn: (payload: SignInPayload) => authApi.signIn(payload),
        onSuccess: async (data) => {
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
