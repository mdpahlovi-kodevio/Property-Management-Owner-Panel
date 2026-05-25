import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Link, useRouterState } from '@tanstack/react-router'

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon?: React.ReactNode
    }[]
}) {
    const pathname = useRouterState({ select: (s) => s.location.pathname })

    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item) => {
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
