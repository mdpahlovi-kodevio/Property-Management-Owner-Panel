import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { createFileRoute } from '@tanstack/react-router'
import { Globe, Phone, Shield, User } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<TabId>('profile')

    return (
        <>
            <PageHeader title={t('settings.title')} description={t('settings.description')} />

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
                            {t(`settings.tabs.${tab.id}`)}
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
    const { t } = useTranslation()
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
                <h3 className="text-base font-semibold text-foreground">{t('settings.profile.title')}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{t('settings.profile.description')}</p>
            </div>

            <Separator />

            {/* Avatar Upload */}
            <div className="flex justify-center">
                <form.AppField name="image">{(field) => <field.FormAvatar folder="settings" />}</form.AppField>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <form.AppField name="name">{(field) => <field.FormInput label={t('settings.profile.name')} placeholder={t('settings.profile.namePlaceholder')} />}</form.AppField>

                <form.AppField name="email">
                    {(field) => <field.FormInput type="email" label={t('settings.profile.email')} placeholder={t('settings.profile.emailPlaceholder')} />}
                </form.AppField>
            </div>

            {/* Save Button */}
            <div>
                <form.AppForm>
                    <form.FormSubmit label={t('settings.profile.save')} />
                </form.AppForm>
            </div>
        </form>
    )
}

// ─── General Tab ────────────────────────────────────────────────────────────────

const TIMEZONES = [
    'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:30', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00',
    'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:30', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00',
    'UTC+00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00', 'UTC+03:30', 'UTC+04:00', 'UTC+04:30',
    'UTC+05:00', 'UTC+05:30', 'UTC+05:45', 'UTC+06:00', 'UTC+06:30', 'UTC+07:00', 'UTC+08:00',
    'UTC+08:45', 'UTC+09:00', 'UTC+09:30', 'UTC+10:00', 'UTC+10:30', 'UTC+11:00', 'UTC+12:00',
    'UTC+12:45', 'UTC+13:00', 'UTC+14:00',
]

function GeneralTab() {
    const { t, i18n } = useTranslation()
    const [darkMode, setDarkMode] = useState(false)
    const [compactView, setCompactView] = useState(false)

    const reverseMap: Record<string, string> = { en: 'English', de: 'German', nl: 'Dutch' }

    const form = useAppForm({
        defaultValues: { language: reverseMap[i18n.language] || 'English', timezone: 'UTC+06:00' },
        validators: { onChange: generalSchema },
        onSubmit: async ({ value }) => {
            console.log('General saved:', value)
            const map: Record<string, string> = { English: 'en', German: 'de', Dutch: 'nl' }
            if (map[value.language]) {
                i18n.changeLanguage(map[value.language])
                localStorage.setItem('app-language', map[value.language])
            }
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
                <h3 className="text-base font-semibold text-foreground">{t('settings.general.title')}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{t('settings.general.description')}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <form.AppField name="language">
                    {(field) => (
                        <field.FormSelect
                            label={t('settings.general.language')}
                            placeholder="Select a language"
                            options={[
                                { label: 'English', value: 'English' },
                                { label: 'Dutch', value: 'Dutch' },
                                { label: 'German', value: 'German' },
                            ]}
                        />
                    )}
                </form.AppField>

                <form.AppField name="timezone">
                    {(field) => (
                        <field.FormSelect
                            label={t('settings.general.timezone')}
                            placeholder="Select a timezone"
                            options={TIMEZONES.map((tz) => ({ label: tz, value: tz }))}
                        />
                    )}
                </form.AppField>
            </div>

            <Separator />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground">{t('settings.general.darkMode.label')}</p>
                        <p className="text-xs text-muted-foreground">{t('settings.general.darkMode.description')}</p>
                    </div>
                    <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground">{t('settings.general.compactView.label')}</p>
                        <p className="text-xs text-muted-foreground">{t('settings.general.compactView.description')}</p>
                    </div>
                    <Switch checked={compactView} onCheckedChange={setCompactView} />
                </div>
            </div>

            <div>
                <form.AppForm>
                    <form.FormSubmit label={t('settings.general.save')} />
                </form.AppForm>
            </div>
        </form>
    )
}

// ─── Security Tab ───────────────────────────────────────────────────────────────

function SecurityTab() {
    const { t } = useTranslation()
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
                <h3 className="text-base font-semibold text-foreground">{t('settings.security.title')}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{t('settings.security.description')}</p>
            </div>

            <Separator />

            {/* Change Password */}
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 max-w-md">
                    <form.AppField name="currentPassword">
                        {(field) => <field.FormInput type="password" label={t('settings.security.currentPassword')} placeholder={t('settings.security.currentPasswordPlaceholder')} />}
                    </form.AppField>

                    <form.AppField name="newPassword">
                        {(field) => <field.FormInput type="password" label={t('settings.security.newPassword')} placeholder={t('settings.security.newPasswordPlaceholder')} />}
                    </form.AppField>

                    <form.AppField name="confirmPassword">
                        {(field) => <field.FormInput type="password" label={t('settings.security.confirmPassword')} placeholder={t('settings.security.confirmPasswordPlaceholder')} />}
                    </form.AppField>
                </div>
            </div>

            <Separator />

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {t('settings.security.twoFactor.label')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 ml-6">{t('settings.security.twoFactor.description')}</p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>
            <div>
                <form.AppForm>
                    <form.FormSubmit label={t('settings.security.save')} />
                </form.AppForm>
            </div>
        </form>
    )
}

// ─── Contact Tab ────────────────────────────────────────────────────────────────

function ContactTab() {
    const { t } = useTranslation()
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
                <h3 className="text-base font-semibold text-foreground">{t('settings.contact.title')}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{t('settings.contact.description')}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <form.AppField name="phone">
                    {(field) => <field.FormInput label={t('settings.contact.phone')} placeholder={t('settings.contact.phonePlaceholder')} />}
                </form.AppField>

                <form.AppField name="contactEmail">
                    {(field) => <field.FormInput type="email" label={t('settings.contact.contactEmail')} placeholder={t('settings.contact.contactEmailPlaceholder')} />}
                </form.AppField>

                <form.AppField name="address">
                    {(field) => <field.FormInput label={t('settings.contact.address')} placeholder={t('settings.contact.addressPlaceholder')} />}
                </form.AppField>

                <form.AppField name="city">{(field) => <field.FormInput label={t('settings.contact.city')} placeholder={t('settings.contact.cityPlaceholder')} />}</form.AppField>

                <form.AppField name="country">
                    {(field) => <field.FormInput label={t('settings.contact.country')} placeholder={t('settings.contact.countryPlaceholder')} />}
                </form.AppField>
            </div>

            <div>
                <form.AppForm>
                    <form.FormSubmit label={t('settings.contact.save')} />
                </form.AppForm>
            </div>
        </form>
    )
}
