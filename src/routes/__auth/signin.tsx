import { useAppForm } from '@/components/form/form-context'
import { Checkbox } from '@/components/ui/checkbox'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import * as z from 'zod'
import { auth } from '@/lib/auth-client'
import { toast } from 'sonner'

export const Route = createFileRoute('/__auth/signin')({
    component: RouteComponent,
})

const signinSchema = z.object({
    email: z.email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(32, 'Password must be at most 32 characters'),
    remember: z.boolean(),
})

function RouteComponent() {
    const navigate = useNavigate()

    const form = useAppForm({
        defaultValues: { email: '', password: '', remember: false },
        validators: { onChange: signinSchema },
        onSubmit: async ({ value }) => {
            await auth.signIn.email(
                {
                    email: value.email,
                    password: value.password,
                    rememberMe: value.remember,
                },
                {
                    onSuccess: async ({ data }) => {
                        if (!data.user.emailVerified) {
                            navigate({ to: "/verification", search: { user: data.user.email, type: "signup" } as any });
                        } else if (data.user.role !== "admin" && data.user.role !== "superadmin") {
                            await auth.signOut();
                            toast.error("You do not have access to this portal.");
                            navigate({ to: "/signin" } as any);
                        } else {
                            navigate({ to: "/" });
                        }
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message || "Failed to sign in");
                    }
                },
            );
        },
    })

    return (
        <div className="my-16 mx-auto flex w-full max-w-150 flex-col gap-6 rounded-lg border p-6 bg-white">
            <h2 className="text-center text-2xl font-bold">Sign In</h2>

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

                <form.AppField name="password">
                    {(field) => <field.FormInput type="password" label="Password" placeholder="Enter your password" />}
                </form.AppField>

                <div className="flex items-center justify-between">
                    <form.AppField name="remember">
                        {(field) => (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    checked={field.state.value}
                                    onCheckedChange={(c) => field.handleChange(c === true)}
                                />
                                <label htmlFor="remember" className="text-sm text-muted-foreground">
                                    Remember me
                                </label>
                            </div>
                        )}
                    </form.AppField>

                    <Link to="/forgot-password" className="text-primary font-medium hover:underline">
                        Forgot password?
                    </Link>
                </div>

                <form.AppForm>
                    <form.FormSubmit label="Sign In" />
                </form.AppForm>
            </form>
        </div>
    )
}
