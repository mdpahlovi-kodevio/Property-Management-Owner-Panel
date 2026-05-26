'use client'

import { NavMain } from '@/components/main/nav-main'
import { NavUser } from '@/components/main/nav-user'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { Headphones, LayoutDashboard, ShieldAlert, CircleCheck, Calendar1, House, MessageCircleMore, User, CreditCard, IdCardLanyard, ShieldUser, Star, FileText, Settings, } from 'lucide-react'
import * as React from 'react'

/** sidebar menus: 
* Dashboard
* Reservations
* Calendar
* Inbox
* Rentals
* Users Management
* Payments
* Channel Manager
* Employee
* Role Management
* Reviews
* Reports
* Support
* Settings
* Logout

*/
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
            title: 'Reservations',
            url: '/reservations',
            icon: <CircleCheck />,
        },
        {
            title: 'Calendar',
            url: '/calendar',
            icon: <Calendar1 />,
        },
        {
            title: 'Inbox',
            url: '/inbox',
            icon: <MessageCircleMore />,
        },
        {
            title: 'Rentals',
            url: '/rentals',
            icon: <House />,
        },
        {
            title: 'Users Management',
            url: '/user-management',
            icon: <User />,
        },
        {
            title: 'Payments',
            url: '/payments',
            icon: <CreditCard />,
        },
        {
            title: 'Channel Manager',
            url: '/channel-manager',
            icon: <CircleCheck />,
        },
        {
            title: 'Employee',
            url: '/employees',
            icon: <IdCardLanyard />,
        },
        {
            title: 'Role Management',
            url: '/role-management',
            icon: <ShieldUser />,
        },
        {
            title: 'Reviews',
            url: '/reviews',
            icon: <Star />,
        },
        {
            title: 'Reports',
            url: '/reports',
            icon: <FileText />,
        },
        {
            title: 'Support',
            url: '/support',
            icon: <Headphones />,
        },
        {
            title: 'Settings',
            url: '/settings',
            icon: <Settings />,
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
