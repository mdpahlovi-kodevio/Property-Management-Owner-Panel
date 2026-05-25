import { AppSidebar, data } from '#/components/main/app-sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'

const routeLabels: Record<string, string> = {
    '/': 'Dashboard',
    '/users': 'Users',
    '/property-owners': 'Property Owners',
    '/properties': 'Properties',
    '/reservations': 'Reservations',
    '/website-builder': 'Website Builder',
    '/employees': 'Employee',
    '/role-management': 'Role Management',
    '/reports': 'Reports',
    '/support': 'Support',
}

export const Route = createFileRoute('/__main')({
    component: RouteComponent,
})

function RouteComponent() {
    const pathname = useRouterState({ select: (s) => s.location.pathname })

    const segments = pathname.split('/').filter(Boolean)
    const crumbs = segments.map((_, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/')
        const label = routeLabels[href] ?? segments[index].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        return { href, label }
    })

    const isHome = pathname === '/'

    return (
        <SidebarProvider>
            <TooltipProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 items-center gap-2 px-4 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="my-auto mr-2 data-[orientation=vertical]:h-4" />
                        <Breadcrumb className="flex-1">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    {isHome ? (
                                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link to="/">Dashboard</Link>
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
                        </Breadcrumb>

                        <span className="ml-auto mr-1 flex items-center gap-2 rounded-md border bg-muted px-3 py-1 text-xs uppercase font-medium text-muted-foreground">
                            {data.user.role}
                        </span>
                    </header>
                    <div className="flex flex-1 flex-col gap-5 p-5">
                        <Outlet />
                    </div>
                </SidebarInset>
            </TooltipProvider>
        </SidebarProvider>
    )
}
