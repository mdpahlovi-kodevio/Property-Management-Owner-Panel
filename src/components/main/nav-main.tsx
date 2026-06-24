import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import type { Session } from '@/lib/api'
import { hasRoutePermission } from '@/lib/permission'
import { Link, useRouterState } from '@tanstack/react-router'
import * as React from 'react'

export function NavMain({
    items,
    user,
}: {
    items: {
        title: string
        url: string
        icon?: React.ReactNode
    }[]
    user: Session['user']
}) {
    const pathname = useRouterState({ select: (s) => s.location.pathname })

    const visibleItems = React.useMemo(() => items.filter((item) => hasRoutePermission(user, item.url)), [items, user])

    return (
        <SidebarGroup>
            <SidebarMenu>
                {visibleItems.map((item) => {
                    const isActive = item.url === '/' ? pathname === '/' : pathname.startsWith(item.url)

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton isActive={isActive} tooltip={item.title} asChild>
                                <Link to={item.url}>
                                    {item.icon}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}
