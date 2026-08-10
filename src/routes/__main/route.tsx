import { AppSidebar } from '@/components/main/app-sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Switch } from '@/components/ui/switch'
import { TooltipProvider } from '@/components/ui/tooltip'
import { authApi, SessionKey } from '@/lib/api'
import { COMPACT_MODE_STORAGE_KEY, useCompactMode } from '@/lib/compact-mode'
import { getModuleByPath, MODULE_KEYS, MODULES } from '@/lib/module'
import { checkRoutePermission, getModuleKeyFromPath } from '@/lib/permission'
import { queryClient } from '@/main'
import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from '@tanstack/react-router'
import { LayoutGrid, List, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const Route = createFileRoute('/__main')({
    beforeLoad: async ({ location }) => {
        const session = await queryClient.ensureQueryData({
            queryKey: SessionKey,
            queryFn: () => authApi.getSession().catch(() => null),
        })

        if (!session) {
            throw redirect({ to: '/signin' })
        }
        if (!session.user.emailVerified) {
            throw redirect({ to: '/verification', search: { user: session.user.email, type: 'signup' } })
        }

        // Compact mode hides management modules — send the owner back to the dashboard.
        if (typeof window !== 'undefined' && window.localStorage.getItem(COMPACT_MODE_STORAGE_KEY) === '1') {
            const moduleKey = getModuleKeyFromPath(location.pathname)
            if (moduleKey && !MODULES[moduleKey].compact) {
                throw redirect({ to: '/' })
            }
        }

        checkRoutePermission(session.user, location.pathname)
        return session
    },
    component: RouteComponent,
})

// Derived breadcrumb labels from modules
const buildRouteLabels = (t: (key: string, opts?: { defaultValue?: string }) => string): Record<string, string> =>
    Object.fromEntries(MODULE_KEYS.map((id) => [MODULES[id].path, t(`navigation.${id}`, { defaultValue: id })]))

function RouteComponent() {
    const { t } = useTranslation()
    const { user } = Route.useRouteContext()
    const pathname = useRouterState({ select: (s) => s.location.pathname })
    const { compactMode } = useCompactMode()
    const navigate = useNavigate()

    // If compact mode is switched on while on a hidden module, go back to the dashboard.
    useLayoutEffect(() => {
        if (!compactMode) return
        const moduleKey = getModuleKeyFromPath(pathname)
        if (moduleKey && !MODULES[moduleKey].compact) {
            navigate({ to: '/' })
        }
    }, [compactMode, pathname, navigate])

    const routeLabels = buildRouteLabels(t)

    const segments = pathname.split('/').filter(Boolean)
    const crumbs = segments.map((_, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/')
        const id = getModuleByPath(href)
        const label = id ? routeLabels[href] : segments[index].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        return { href, label }
    })

    const isHome = pathname === '/'

    return (
        <SidebarProvider>
            <TooltipProvider>
                <AppSidebar user={user} />
                <SidebarInset>
                    <header className="sticky top-0 z-10 bg-background flex h-16 items-center gap-2 px-4 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="my-auto mr-2 data-[orientation=vertical]:h-4" />
                        <Breadcrumb className="flex-1">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    {isHome ? (
                                        <BreadcrumbPage>{t('navigation.dashboard', { defaultValue: 'Dashboard' })}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link to="/">{t('navigation.dashboard', { defaultValue: 'Dashboard' })}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>

                                {crumbs.map((crumb, index) => {
                                    const isLast = index === crumbs.length - 1
                                    return (
                                        <span key={crumb.href} className="contents">
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                {isLast ? (
                                                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                                ) : (
                                                    <BreadcrumbLink asChild>
                                                        <Link to={crumb.href}>{crumb.label}</Link>
                                                    </BreadcrumbLink>
                                                )}
                                            </BreadcrumbItem>
                                        </span>
                                    )
                                })}
                            </BreadcrumbList>
                        </Breadcrumb>{' '}
                        <div className="ml-auto flex items-center gap-2">
                            <DarkModeToggle />
                            <CompactModeToggle />
                            <span className="mr-1 flex items-center gap-2 rounded-md border bg-muted px-3 py-1 text-xs uppercase font-medium text-muted-foreground">
                                {user.isDefault ? 'Super Admin' : user.role}
                            </span>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-6 p-6">
                        <Outlet />
                    </div>
                </SidebarInset>
            </TooltipProvider>
        </SidebarProvider>
    )
}

function DarkModeToggle() {
    const { t } = useTranslation()
    const { resolvedTheme, setTheme } = useTheme()
    const isDark = resolvedTheme === 'dark'

    const handleCheckedChange = (checked: boolean) => {
        setTheme(checked ? 'dark' : 'light')
        toast.success(
            checked
                ? t('header.darkModeOn', { defaultValue: 'Dark mode enabled.' })
                : t('header.darkModeOff', { defaultValue: 'Light mode restored.' }),
        )
    }

    return (
        <div
            className="flex items-center gap-2 rounded-md border bg-muted px-3 py-1.5"
            role="group"
            aria-label={t('header.darkMode', { defaultValue: 'Dark mode' })}
        >
            {isDark ? <Moon className="size-3.5 text-muted-foreground" /> : <Sun className="size-3.5 text-muted-foreground" />}
            <span className="hidden sm:inline text-xs font-medium text-muted-foreground">
                {isDark ? t('header.darkMode', { defaultValue: 'Dark mode' }) : t('header.lightMode', { defaultValue: 'Light mode' })}
            </span>
            <Switch size="sm" checked={isDark} onCheckedChange={handleCheckedChange} />
        </div>
    )
}

function CompactModeToggle() {
    const { t } = useTranslation()
    const { compactMode, setCompactMode } = useCompactMode()

    const handleCheckedChange = (checked: boolean) => {
        setCompactMode(checked)
        toast.success(
            checked
                ? t('header.compactModeOn', { defaultValue: 'Compact view enabled. Showing only the essential modules.' })
                : t('header.compactModeOff', { defaultValue: 'Full view restored. All modules are available again.' }),
        )
    }

    return (
        <div
            className="flex items-center gap-2 rounded-md border bg-muted px-3 py-1.5"
            role="group"
            aria-label={t('header.compactView', { defaultValue: 'Compact view' })}
        >
            {compactMode ? <List className="size-3.5 text-muted-foreground" /> : <LayoutGrid className="size-3.5 text-muted-foreground" />}
            <span className="hidden sm:inline text-xs font-medium text-muted-foreground">
                {compactMode
                    ? t('header.compactView', { defaultValue: 'Compact view' })
                    : t('header.fullView', { defaultValue: 'Full view' })}
            </span>
            <Switch size="sm" checked={compactMode} onCheckedChange={handleCheckedChange} />
        </div>
    )
}
