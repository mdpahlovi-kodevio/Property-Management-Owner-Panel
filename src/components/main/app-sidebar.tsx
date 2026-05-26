'use client'

import { NavMain } from '@/components/main/nav-main'
import { NavUser } from '@/components/main/nav-user'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { Contact, Headphones, LayoutDashboard, ShieldAlert } from 'lucide-react'
import * as React from 'react'

export const data = {
    user: {
        name: 'shadcn',
        email: 'm@example.com',
        avatar: '/avatars/shadcn.jpg',
        role: 'Property Owner',
    },
    navMain: [
        {
            title: 'Dashboard',
            url: '/',
            icon: <LayoutDashboard />,
        },
        {
            title: 'Employee',
            url: '/employees',
            icon: <Contact />,
        },
        {
            title: 'Role Management',
            url: '/role-management',
            icon: <ShieldAlert />,
        },
        {
            title: 'Support',
            url: '/support',
            icon: <Headphones />,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg overflow-hidden">
                        <img src="/logo.png" alt="Logo" className="size-full object-contain" />
                    </div>
                    <span className="truncate text-lg font-semibold group-data-[collapsible=icon]:hidden">Obsonlineservices</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
