import { useAppForm } from '@/components/form/form-context'
import { createFileRoute } from '@tanstack/react-router'
import * as z from 'zod'

const searchSchema = z.object({
    token: z.string().optional(),
    error: z.string().optional(),
})

export const Route = createFileRoute('/__auth/reset-password')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

const resetSchema = z
    .object({
        password: z.string().min(8, 'Password must be at least 8 characters').max(32, 'Password must be at most 32 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })

function RouteComponent() {
    // const navigate = useNavigate()
    const { token, error } = Route.useSearch()

    const form = useAppForm({
        defaultValues: { password: '', confirmPassword: '' },
        validators: { onChange: resetSchema },
        onSubmit: async ({ value }) => {
            console.log(value)
            // if (!token) {
            //     toast.error('Reset link is invalid or has expired. Please request a new one.')
            //     return
            // }
            // await auth.resetPassword(
            //     { token, newPassword: value.password },
            //     {
            //         onSuccess: () => {
            //             toast.success('Password reset successfully!')
            //             navigate({ to: '/signin' })
            //         },
            //     },
            // )
        },
    })

    if (error || !token) {
        return (
            <p className="text-center text-sm text-muted-foreground">
                This reset link is invalid or has expired.{' '}
                <a href="/forgot-password" className="underline">
                    Request a new one
                </a>
                .
            </p>
        )
    }

    return (
        <div className="my-16 mx-auto flex w-full max-w-150 flex-col gap-6 rounded-lg border p-6 bg-white">
            <div>
                <h2 className="text-center text-2xl font-bold">Reset Password</h2>
                <p className="mt-2 text-center text-muted-foreground">Create a new password for your account.</p>
            </div>

            <form
                className="grid gap-6"
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
            >
                <form.AppField name="password">
                    {(field) => <field.FormInput type="password" label="New Password" placeholder="Enter your password" />}
                </form.AppField>

                <form.AppField name="confirmPassword">
                    {(field) => <field.FormInput type="password" label="Confirm Password" placeholder="Enter your password" />}
                </form.AppField>

                <form.AppForm>
                    <form.FormSubmit label="Submit" />
                </form.AppForm>
            </form>
        </div>
    )
}
