import { useAppForm } from '@/components/form/form-context'
import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/__auth/forgot-password')({
    component: RouteComponent,
})

const forgotSchema = z.object({
    email: z.email('Enter your email address'),
})

function RouteComponent() {
    // const navigate = useNavigate()

    const form = useAppForm({
        defaultValues: { email: '' },
        validators: { onChange: forgotSchema },
        onSubmit: async ({ value }) => {
            console.log(value)
            // await auth.requestPasswordReset(
            //     {
            //         email: value.email,
            //         redirectTo: `${import.meta.env.VITE_APP_CLIENT}/reset-password`,
            //     },
            //     {
            //         onSuccess: () => {
            //             toast.success("Password reset link sent to your email!");
            //             navigate({ to: "/verification", search: { user: value.email, type: "reset" } });
            //         },
            //     },
            // );
        },
    })

    return (
        <div className="my-16 mx-auto flex w-full max-w-150 flex-col gap-6 rounded-lg border p-6 bg-white">
            <div>
                <h2 className="text-center text-2xl font-bold">Forgot Password</h2>
                <p className="mt-2 text-center text-muted-foreground">
                    Enter your registered email address and we’ll send you a <br />
                    verification code to reset your password.
                </p>
            </div>

            <form
                className="grid gap-6"
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
            >
                <form.AppField name="email">
                    {(field) => <field.FormInput type="email" label="Email" placeholder="Enter your email" />}
                </form.AppField>

                <form.AppForm>
                    <form.FormSubmit label="Reset Password" />
                </form.AppForm>
            </form>

            <p className="text-center text-muted-foreground">
                Remember your password?{' '}
                <Link to="/signin" className="text-foreground font-medium hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    )
}
