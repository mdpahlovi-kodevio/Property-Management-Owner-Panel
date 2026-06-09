import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { createFileRoute } from '@tanstack/react-router'
import { Globe, Phone, Shield, User } from 'lucide-react'
import { useState } from 'react'
import * as z from 'zod'

export const Route = createFileRoute('/__main/settings')({
    component: RouteComponent,
})

const TABS = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'general', label: 'General', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'contact', label: 'Contact', icon: Phone },
] as const

type TabId = (typeof TABS)[number]['id']

// ─── Schemas ────────────────────────────────────────────────────────────────────

const profileSchema = z.object({
    image: z.string(),
    name: z.string().min(1, 'Name is required'),
    email: z.email('Please enter a valid email address'),
})

const generalSchema = z.object({
    language: z.string().min(1, 'Language is required'),
    timezone: z.string().min(1, 'Timezone is required'),
})

const securitySchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
})

const contactSchema = z.object({
    phone: z.string(),
    contactEmail: z.string(),
    address: z.string(),
    city: z.string(),
    country: z.string(),
})

// ─── Main Component ─────────────────────────────────────────────────────────────

function RouteComponent() {
    const [activeTab, setActiveTab] = useState<TabId>('profile')

    return (
        <>
            <PageHeader title="Settings" description="Manage your Settings" />

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5">
                {/* Left Sidebar Tabs */}
                <nav className="flex flex-row md:flex-col gap-1">
                    {TABS.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                            onClick={() => setActiveTab(tab.id)}
                            className="justify-start"
                        >
                            {tab.label}
                        </Button>
                    ))}
                </nav>

                {/* Right Content Area */}
                <div className="border rounded-xl bg-card p-5 min-h-120">
                    {activeTab === 'profile' && <ProfileTab />}
                    {activeTab === 'general' && <GeneralTab />}
                    {activeTab === 'security' && <SecurityTab />}
                    {activeTab === 'contact' && <ContactTab />}
                </div>
            </div>
        </>
    )
}

// ─── Profile Information Tab ────────────────────────────────────────────────────

function ProfileTab() {
    const form = useAppForm({
        defaultValues: { image: '', name: '', email: '' },
        validators: { onChange: profileSchema },
        onSubmit: async ({ value }) => {
            console.log('Profile saved:', value)
        },
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="flex flex-col gap-5"
        >
            <div>
                <h3 className="text-base font-semibold text-foreground">Profile Information</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Update your account details and contact information.</p>
            </div>

            <Separator />

            {/* Avatar Upload */}
            <div className="flex justify-center">
                <form.AppField name="image">{(field) => <field.FormAvatar folder="settings" />}</form.AppField>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <form.AppField name="name">{(field) => <field.FormInput label="Name" placeholder="Enter your name" />}</form.AppField>

                <form.AppField name="email">
                    {(field) => <field.FormInput type="email" label="Email" placeholder="Enter your email" />}
                </form.AppField>
            </div>

            {/* Save Button */}
            <div>
                <form.AppForm>
                    <form.FormSubmit label="Save Changes" />
                </form.AppForm>
            </div>
        </form>
    )
}

// ─── General Tab ────────────────────────────────────────────────────────────────

function GeneralTab() {
    const [darkMode, setDarkMode] = useState(false)
    const [compactView, setCompactView] = useState(false)

    const form = useAppForm({
        defaultValues: { language: 'Bangla', timezone: 'UTC+06:00' },
        validators: { onChange: generalSchema },
        onSubmit: async ({ value }) => {
            console.log('General saved:', value)
        },
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="flex flex-col gap-5"
        >
            <div>
                <h3 className="text-base font-semibold text-foreground">General</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Manage your application preferences.</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <form.AppField name="language">{(field) => <field.FormInput label="Language" placeholder="e.g. English" />}</form.AppField>

                <form.AppField name="timezone">
                    {(field) => <field.FormInput label="Timezone" placeholder="e.g. UTC+06:00" />}
                </form.AppField>
            </div>

            <Separator />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground">Dark Mode</p>
                        <p className="text-xs text-muted-foreground">Toggle dark theme for the application.</p>
                    </div>
                    <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground">Compact View</p>
                        <p className="text-xs text-muted-foreground">Use compact layout for tables and lists.</p>
                    </div>
                    <Switch checked={compactView} onCheckedChange={setCompactView} />
                </div>
            </div>

            <div>
                <form.AppForm>
                    <form.FormSubmit label="Save Changes" />
                </form.AppForm>
            </div>
        </form>
    )
}

// ─── Security Tab ───────────────────────────────────────────────────────────────

function SecurityTab() {
    const [twoFactor, setTwoFactor] = useState(false)

    const form = useAppForm({
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
        validators: { onChange: securitySchema },
        onSubmit: async ({ value }) => {
            console.log('Security saved:', value)
        },
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="flex flex-col gap-5"
        >
            <div>
                <h3 className="text-base font-semibold text-foreground">Security</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Manage your password and security settings.</p>
            </div>

            <Separator />

            {/* Change Password */}
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 max-w-md">
                    <form.AppField name="currentPassword">
                        {(field) => <field.FormInput type="password" label="Current Password" placeholder="Enter current password" />}
                    </form.AppField>

                    <form.AppField name="newPassword">
                        {(field) => <field.FormInput type="password" label="New Password" placeholder="Enter new password" />}
                    </form.AppField>

                    <form.AppField name="confirmPassword">
                        {(field) => <field.FormInput type="password" label="Confirm Password" placeholder="Confirm new password" />}
                    </form.AppField>
                </div>
            </div>

            <Separator />

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Two-Factor Authentication
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 ml-6">Add an extra layer of security to your account.</p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>

            <div>
                <form.AppForm>
                    <form.FormSubmit label="Update Security" />
                </form.AppForm>
            </div>
        </form>
    )
}

// ─── Contact Tab ────────────────────────────────────────────────────────────────

function ContactTab() {
    const form = useAppForm({
        defaultValues: { phone: '', contactEmail: '', address: '', city: '', country: '' },
        validators: { onChange: contactSchema },
        onSubmit: async ({ value }) => {
            console.log('Contact saved:', value)
        },
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="flex flex-col gap-5"
        >
            <div>
                <h3 className="text-base font-semibold text-foreground">Contact</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Update your contact information.</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <form.AppField name="phone">
                    {(field) => <field.FormInput label="Phone Number" placeholder="Enter phone number" />}
                </form.AppField>

                <form.AppField name="contactEmail">
                    {(field) => <field.FormInput type="email" label="Contact Email" placeholder="Enter contact email" />}
                </form.AppField>

                <form.AppField name="address">
                    {(field) => <field.FormInput label="Address" placeholder="Enter your address" />}
                </form.AppField>

                <form.AppField name="city">{(field) => <field.FormInput label="City" placeholder="Enter your city" />}</form.AppField>

                <form.AppField name="country">
                    {(field) => <field.FormInput label="Country" placeholder="Enter your country" />}
                </form.AppField>
            </div>

            <div>
                <form.AppForm>
                    <form.FormSubmit label="Save Contact Info" />
                </form.AppForm>
            </div>
        </form>
    )
}
