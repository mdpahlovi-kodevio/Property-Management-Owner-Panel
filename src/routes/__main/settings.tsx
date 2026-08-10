import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { ErrorComp } from '@/components/ui/error-comp'
import { PageHeader } from '@/components/ui/page-header'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { authApi, SessionKey } from '@/lib/api'
import { useCompactMode } from '@/lib/compact-mode'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Copy, Globe, Phone, Shield, User, XCircle } from 'lucide-react'
import { useTheme } from 'next-themes'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

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

// For i18n extractor:
// t('settings.tabs.profile', 'Profile Information')
// t('settings.tabs.general', 'General')
// t('settings.tabs.security', 'Security')
// t('settings.tabs.contact', 'Contact')

// ─── Schemas ────────────────────────────────────────────────────────────────────

const profileSchema = z.object({
    image: z.string(),
    name: z.string().min(2, 'Enter your full name'),
    email: z.email('Enter a valid email address'),
    phone: z.string(),
})

const generalSchema = z.object({
    language: z.string().min(1, 'Select your language'),
    timezone: z.string().min(1, 'Select your timezone'),
})

const securitySchema = z.object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Re-enter your new password'),
})

const contactSchema = z.object({
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
    const { user } = Route.useRouteContext()
    const queryClient = useQueryClient()

    const updateUser = useMutation({
        mutationFn: authApi.updateUser,
        onSuccess: async (data) => {
            queryClient.setQueryData(SessionKey, data)
            toast.success(t('settings.profile.saved', 'Profile updated'))
        },
        onError: (error) => toast.error(error.message),
    })

    const form = useAppForm({
        defaultValues: {
            image: user.image ?? '',
            name: user.name,
            email: user.email,
            phone: user.phone ?? '',
        },
        validators: { onChange: profileSchema },
        onSubmit: async ({ value }) => {
            await updateUser.mutateAsync({
                name: value.name,
                image: value.image,
                phone: value.phone,
            })
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
                <form.AppField name="image">{(field) => <field.FormAvatar folder="owner" />}</form.AppField>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <form.AppField name="name">
                    {(field) => <field.FormInput label={t('settings.profile.name')} placeholder={t('settings.profile.namePlaceholder')} />}
                </form.AppField>

                <form.AppField name="email">
                    {(field) => (
                        <field.FormInput
                            type="email"
                            label={t('settings.profile.email')}
                            placeholder={t('settings.profile.emailPlaceholder')}
                            readOnly
                        />
                    )}
                </form.AppField>

                <form.AppField name="phone">
                    {(field) => (
                        <field.FormInput label={t('settings.profile.phone')} placeholder={t('settings.profile.phonePlaceholder')} />
                    )}
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
    'UTC-12:00',
    'UTC-11:00',
    'UTC-10:00',
    'UTC-09:30',
    'UTC-09:00',
    'UTC-08:00',
    'UTC-07:00',
    'UTC-06:00',
    'UTC-05:00',
    'UTC-04:00',
    'UTC-03:30',
    'UTC-03:00',
    'UTC-02:00',
    'UTC-01:00',
    'UTC+00:00',
    'UTC+01:00',
    'UTC+02:00',
    'UTC+03:00',
    'UTC+03:30',
    'UTC+04:00',
    'UTC+04:30',
    'UTC+05:00',
    'UTC+05:30',
    'UTC+05:45',
    'UTC+06:00',
    'UTC+06:30',
    'UTC+07:00',
    'UTC+08:00',
    'UTC+08:45',
    'UTC+09:00',
    'UTC+09:30',
    'UTC+10:00',
    'UTC+10:30',
    'UTC+11:00',
    'UTC+12:00',
    'UTC+12:45',
    'UTC+13:00',
    'UTC+14:00',
]

function LanguageWatcher({ language, i18n }: { language: string; i18n: any }) {
    useEffect(() => {
        const map: Record<string, string> = { English: 'en', German: 'de', Dutch: 'nl' }
        if (map[language] && i18n.language !== map[language]) {
            i18n.changeLanguage(map[language])
            localStorage.setItem('app-language', map[language])
        }
    }, [language, i18n])
    return null
}

function GeneralTab() {
    const { t, i18n } = useTranslation()
    const { compactMode, setCompactMode } = useCompactMode()
    const { resolvedTheme, setTheme } = useTheme()
    const darkMode = resolvedTheme === 'dark'

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
            <form.Subscribe selector={(state) => state.values.language}>
                {(language) => <LanguageWatcher language={language} i18n={i18n} />}
            </form.Subscribe>
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
                    <Switch checked={darkMode} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground">{t('settings.general.compactView.label')}</p>
                        <p className="text-xs text-muted-foreground">{t('settings.general.compactView.description')}</p>
                    </div>
                    <Switch checked={compactMode} onCheckedChange={setCompactMode} />
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

    const changePassword = useMutation({
        mutationFn: authApi.changePassword,
        onSuccess: (data) => {
            toast.success(data.message)
            form.reset()
        },
        onError: (error) => toast.error(error.message),
    })

    const form = useAppForm({
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
        validators: { onChange: securitySchema },
        onSubmit: async ({ value }) => {
            await changePassword.mutateAsync({
                currentPassword: value.currentPassword,
                newPassword: value.newPassword,
                revokeOtherSessions: true,
            })
        },
    })

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h3 className="text-base font-semibold text-foreground">{t('settings.security.title')}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{t('settings.security.description')}</p>
            </div>

            <Separator />

            {/* Change Password */}
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
                className="flex flex-col gap-4"
            >
                <div className="grid grid-cols-1 gap-4 max-w-md">
                    <form.AppField name="currentPassword">
                        {(field) => (
                            <field.FormInput
                                type="password"
                                label={t('settings.security.currentPassword')}
                                placeholder={t('settings.security.currentPasswordPlaceholder')}
                            />
                        )}
                    </form.AppField>

                    <form.AppField name="newPassword">
                        {(field) => (
                            <field.FormInput
                                type="password"
                                label={t('settings.security.newPassword')}
                                placeholder={t('settings.security.newPasswordPlaceholder')}
                            />
                        )}
                    </form.AppField>

                    <form.AppField name="confirmPassword">
                        {(field) => (
                            <field.FormInput
                                type="password"
                                label={t('settings.security.confirmPassword')}
                                placeholder={t('settings.security.confirmPasswordPlaceholder')}
                            />
                        )}
                    </form.AppField>
                </div>

                <div>
                    <form.AppForm>
                        <form.FormSubmit label={t('settings.security.save')} />
                    </form.AppForm>
                </div>
            </form>

            <Separator />

            {/* Two-Factor Authentication */}
            <MfaSection />
        </div>
    )
}

// ─── MFA Section ────────────────────────────────────────────────────────────

const verifySchema = z.object({
    code: z
        .string()
        .regex(/^\d{6}$/, 'Enter a valid 6-digit code')
        .length(6, 'Enter a valid 6-digit code'),
})

const confirmCodeSchema = z.object({
    password: z.string().min(1, 'Enter your current password'),
    code: z
        .string()
        .regex(/^\d{6}$/, 'Enter a valid 6-digit code')
        .length(6, 'Enter a valid 6-digit code'),
})

type MfaStep = 'idle' | 'verify' | 'backup-codes' | 'disable-confirm'

function MfaSection() {
    const { t } = useTranslation()
    const queryClient = useQueryClient()

    const [step, setStep] = useState<MfaStep>('idle')
    const [secret, setSecret] = useState('')
    const [uri, setUri] = useState('')
    const [qrDataUrl, setQrDataUrl] = useState('')
    const [backupCodes, setBackupCodes] = useState<string[]>([])

    // Fetch MFA status on mount
    const {
        data: status,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['mfa-status'],
        queryFn: () => authApi.mfaStatus(),
    })

    const isEnabled = status?.enabled ?? false

    // ── Forms (declared BEFORE the mutations that close over them) ────────
    const verifyForm = useAppForm({
        defaultValues: { code: '' },
        validators: { onChange: verifySchema },
        onSubmit: async ({ value }) => {
            await enableMutation.mutateAsync(value.code)
        },
    })

    const disableForm = useAppForm({
        defaultValues: { password: '', code: '' },
        validators: { onChange: confirmCodeSchema },
        onSubmit: async ({ value }) => {
            await disableMutation.mutateAsync(value)
        },
    })

    // ── Mutations ───────────────────────────────────────────────────────────
    const setupMutation = useMutation({
        mutationFn: authApi.mfaSetup,
        onSuccess: (data) => {
            setSecret(data.secret)
            setUri(data.uri)
            setStep('verify')
        },
        onError: (error) => toast.error(error.message),
    })

    const enableMutation = useMutation({
        mutationFn: (code: string) => authApi.mfaEnable({ code }),
        onSuccess: (data) => {
            setBackupCodes(data.backupCodes)
            setStep('backup-codes')
            queryClient.invalidateQueries({ queryKey: ['mfa-status'] })
        },
        onError: (error) => toast.error(error.message),
    })

    const disableMutation = useMutation({
        mutationFn: (payload: { password: string; code: string }) => authApi.mfaDisable(payload),
        onSuccess: (data) => {
            toast.success(data.message)
            setStep('idle')
            disableForm.reset()
            queryClient.invalidateQueries({ queryKey: ['mfa-status'] })
        },
        onError: (error) => toast.error(error.message),
    })

    // ── Local QR generation (replaces third-party api.qrserver.com) ───────
    useEffect(() => {
        if (!uri) {
            setQrDataUrl('')
            return
        }
        let cancelled = false
        QRCode.toDataURL(uri, { width: 200, margin: 1 })
            .then((url) => {
                if (!cancelled) setQrDataUrl(url)
            })
            .catch(() => {
                if (!cancelled) setQrDataUrl('')
            })
        return () => {
            cancelled = true
        }
    }, [uri])

    // ── Error fallback for status query ────────────────────────────────────
    if (error) {
        // ErrorComp is a TanStack Router error boundary component; cast to satisfy its prop contract.
        return <ErrorComp error={error} reset={refetch} />
    }

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                {t('settings.security.twoFactor.loading', 'Loading MFA status...')}
            </div>
        )
    }

    // ── Backup Codes screen (shown after initial setup) ──
    if (step === 'backup-codes') {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <p className="text-sm font-medium text-foreground">
                        {t('settings.security.twoFactor.enabled', 'Two-factor authentication is enabled')}
                    </p>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                        {t('settings.security.twoFactor.backupCodesTitle', 'Save your backup codes')}
                    </p>
                    <p className="text-xs text-amber-700 mb-3">
                        {t(
                            'settings.security.twoFactor.backupCodesDescription',
                            'Each code can only be used once. Store them in a safe place — you will need them if you lose access to your authenticator app.',
                        )}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {backupCodes.map((code, i) => (
                            <div key={i} className="relative group">
                                <code className="block bg-white rounded px-2 py-1 text-sm font-mono text-center border">{code}</code>
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(code)
                                        toast.success(t('settings.security.twoFactor.codeCopied', 'Code copied'))
                                    }}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-amber-100"
                                    aria-label="Copy code"
                                >
                                    <Copy className="h-3 w-3 text-amber-700" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={() => {
                        setStep('idle')
                        setBackupCodes([])
                        setSecret('')
                        setUri('')
                    }}
                >
                    {t('settings.security.twoFactor.done', 'Done')}
                </Button>
            </div>
        )
    }

    // ── Verify Code screen (initial setup) ───────────────────────────────
    if (step === 'verify') {
        return (
            <div className="flex flex-col gap-4">
                <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {t('settings.security.twoFactor.setupTitle', 'Set up authenticator app')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {t(
                            'settings.security.twoFactor.setupDescription',
                            'Scan the QR code below with your authenticator app (e.g. Google Authenticator, Authy), then enter the 6-digit code to verify.',
                        )}
                    </p>
                </div>

                <div className="flex justify-center">
                    <div className="rounded-lg border bg-white p-4">
                        {qrDataUrl ? (
                            <img src={qrDataUrl} alt="QR Code" className="h-48 w-48" />
                        ) : (
                            <div className="h-48 w-48 flex items-center justify-center text-xs text-muted-foreground">
                                {t('settings.security.twoFactor.qrError', 'Failed to render QR code. Use the key below.')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                        {t('settings.security.twoFactor.orEnterCode', 'Or enter this key manually:')}
                    </p>
                    <code className="rounded bg-muted px-3 py-1 text-sm font-mono select-all">
                        {secret.match(/.{1,4}/g)?.join(' ') ?? secret}
                    </code>
                </div>

                <form
                    className="flex w-full max-w-md mx-auto flex-col items-center gap-4"
                    onSubmit={(e) => {
                        e.preventDefault()
                        verifyForm.handleSubmit()
                    }}
                >
                    <verifyForm.AppField name="code">
                        {(field) => (
                            <field.FormInputOtp
                                label={t('settings.security.twoFactor.code', 'Verification Code')}
                                disabled={enableMutation.isPending}
                            />
                        )}
                    </verifyForm.AppField>

                    <div className="flex gap-2 justify-center">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setStep('idle')
                                setSecret('')
                                setUri('')
                                setQrDataUrl('')
                                verifyForm.reset()
                            }}
                        >
                            {t('settings.security.twoFactor.cancel', 'Cancel')}
                        </Button>
                        <verifyForm.AppForm>
                            <verifyForm.FormSubmit
                                label={
                                    enableMutation.isPending
                                        ? t('settings.security.twoFactor.enabling', 'Enabling...')
                                        : t('settings.security.twoFactor.enable', 'Enable')
                                }
                            />
                        </verifyForm.AppForm>
                    </div>
                </form>
            </div>
        )
    }

    // ── Disable Confirm screen ───────────────────────────────────────────
    if (step === 'disable-confirm') {
        return (
            <div className="flex flex-col gap-4 max-w-md">
                <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        {t('settings.security.twoFactor.disableTitle', 'Disable Two-Factor Authentication')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {t(
                            'settings.security.twoFactor.disableDescription',
                            'Enter your password and a verification code from your authenticator app to disable MFA.',
                        )}
                    </p>
                </div>

                <form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => {
                        e.preventDefault()
                        disableForm.handleSubmit()
                    }}
                >
                    <disableForm.AppField name="password">
                        {(field) => (
                            <field.FormInput
                                type="password"
                                autoComplete="current-password"
                                label={t('settings.security.twoFactor.disablePassword', 'Current Password')}
                                placeholder={t('settings.security.twoFactor.disablePasswordPlaceholder', 'Enter your password')}
                            />
                        )}
                    </disableForm.AppField>

                    <disableForm.AppField name="code">
                        {(field) => (
                            <field.FormInputOtp
                                label={t('settings.security.twoFactor.code', 'Verification Code')}
                                disabled={disableMutation.isPending}
                            />
                        )}
                    </disableForm.AppField>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setStep('idle')
                                disableForm.reset()
                            }}
                        >
                            {t('settings.security.twoFactor.cancel', 'Cancel')}
                        </Button>
                        <disableForm.AppForm>
                            <disableForm.FormSubmit
                                label={
                                    disableMutation.isPending
                                        ? t('settings.security.twoFactor.disabling', 'Disabling...')
                                        : t('settings.security.twoFactor.disable', 'Disable')
                                }
                                destructive
                            />
                        </disableForm.AppForm>
                    </div>
                </form>
            </div>
        )
    }

    // ── Idle screen (default) ─────────────────────────────────────────────
    if (isEnabled) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Shield className="h-4 w-4 text-emerald-500" />
                            {t('settings.security.twoFactor.label', 'Two-Factor Authentication')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                            {t('settings.security.twoFactor.enabledStatus', 'MFA is currently enabled.')}
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        {t('settings.security.twoFactor.enabled', 'Enabled')}
                    </span>
                </div>

                <Button
                    variant="outline"
                    className="w-fit text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setStep('disable-confirm')}
                >
                    {t('settings.security.twoFactor.disable', 'Disable')}
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {t('settings.security.twoFactor.label', 'Two-Factor Authentication')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                        {t('settings.security.twoFactor.description', 'Add an extra layer of security to your account.')}
                    </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    <XCircle className="h-3 w-3" />
                    {t('settings.security.twoFactor.disabled', 'Disabled')}
                </span>
            </div>

            <Button className="w-fit" onClick={() => setupMutation.mutate()} disabled={setupMutation.isPending}>
                {setupMutation.isPending
                    ? t('settings.security.twoFactor.settingUp', 'Setting up...')
                    : t('settings.security.twoFactor.setup', 'Set up')}
            </Button>
        </div>
    )
}

// ─── Contact Tab ────────────────────────────────────────────────────────────────

function ContactTab() {
    const { t } = useTranslation()
    const form = useAppForm({
        defaultValues: { address: '', city: '', country: '' },
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
                <form.AppField name="address">
                    {(field) => (
                        <field.FormInput label={t('settings.contact.address')} placeholder={t('settings.contact.addressPlaceholder')} />
                    )}
                </form.AppField>

                <form.AppField name="city">
                    {(field) => <field.FormInput label={t('settings.contact.city')} placeholder={t('settings.contact.cityPlaceholder')} />}
                </form.AppField>

                <form.AppField name="country">
                    {(field) => (
                        <field.FormInput label={t('settings.contact.country')} placeholder={t('settings.contact.countryPlaceholder')} />
                    )}
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
