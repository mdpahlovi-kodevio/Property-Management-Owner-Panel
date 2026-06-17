'use client'

import { NavMain } from '@/components/main/nav-main'
import { NavUser } from '@/components/main/nav-user'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import type { Session } from '@/lib/api/auth'
import { MODULES, MODULE_KEYS } from '@/lib/module'
import { MODULE_ICONS } from '@/lib/module-icons'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: Session['user'] }) {
    const { t } = useTranslation()

    // Derived from module keys
    const navMain = MODULE_KEYS.map((key) => {
        const Icon = MODULE_ICONS[key]
        return {
            key,
            title: t(`navigation.${key}`, { defaultValue: key }),
            url: MODULES[key].path,
            icon: <Icon className="size-4" />,
        }
    })

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
                <NavMain items={navMain} user={user} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
