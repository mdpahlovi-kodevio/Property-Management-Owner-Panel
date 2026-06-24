import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { authApi } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

const searchSchema = z.object({
    token: z.string().min(1),
})

export const Route = createFileRoute('/__auth/reset-password')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { token } = Route.useSearch()

    const resetSchema = z
        .object({
            password: z
                .string()
                .min(8, t('auth.passwordMin', 'Password must be at least 8 characters'))
                .max(32, t('auth.passwordMax', 'Password must be at most 32 characters')),
            confirmPassword: z.string().min(1, t('auth.confirmPasswordReq', 'Please confirm your password')),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: t('auth.passwordsDontMatch', "Passwords don't match"),
            path: ['confirmPassword'],
        })

    const reset = useMutation({
        mutationFn: authApi.resetPassword,
        onSuccess: () => {
            toast.success(t('auth.passwordResetSuccess', 'Password reset successfully!'))
            navigate({ to: '/signin' })
        },
        onError: (error) => toast.error(error.message),
    })

    const form = useAppForm({
        defaultValues: { password: '', confirmPassword: '' },
        validators: { onChange: resetSchema },
        onSubmit: async ({ value }) => {
            await reset.mutateAsync({
                token,
                password: value.password,
            })
        },
    })

    return (
        <div className="my-16 mx-auto flex w-full max-w-150 flex-col gap-6 rounded-lg border p-6 bg-white">
            <div>
                <h2 className="text-center text-2xl font-bold">{t('auth.resetPassword', 'Reset Password')}</h2>
                <p className="mt-2 text-center text-muted-foreground">
                    {t('auth.resetPasswordDesc', 'Choose a new password for your account.')}
                </p>
            </div>

            <form
                className="grid gap-6"
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
            >
                <form.AppField name="password">
                    {(field) => (
                        <field.FormInput
                            type="password"
                            label={t('auth.newPassword', 'New Password')}
                            placeholder={t('auth.enterPassword', 'Enter your password')}
                        />
                    )}
                </form.AppField>

                <form.AppField name="confirmPassword">
                    {(field) => (
                        <field.FormInput
                            type="password"
                            label={t('auth.confirmPassword', 'Confirm Password')}
                            placeholder={t('auth.enterPassword', 'Enter your password')}
                        />
                    )}
                </form.AppField>

                <form.AppForm>
                    <form.FormSubmit label={t('auth.submit', 'Submit')} />
                </form.AppForm>
            </form>

            <Button asChild variant="outline">
                <Link to="/signin">{t('auth.backToSignIn', 'Back to Sign In')}</Link>
            </Button>
        </div>
    )
}
