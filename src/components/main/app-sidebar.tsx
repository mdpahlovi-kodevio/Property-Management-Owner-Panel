'use client'

import { NavMain } from '@/components/main/nav-main'
import { NavUser } from '@/components/main/nav-user'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import type { Session } from '@/lib/api'
import { useCompactMode } from '@/lib/compact-mode'
import { COMPACT_MODULE_KEYS, MODULES, MODULE_KEYS } from '@/lib/module'
import { MODULE_ICONS } from '@/lib/module-icons'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: Session['user'] }) {
    const { t } = useTranslation()
    const { compactMode } = useCompactMode()

    // Derived from module keys (in compact mode only the monitoring modules are shown)
    const navMain = MODULE_KEYS.filter((key) => !compactMode || COMPACT_MODULE_KEYS.includes(key)).map((key) => {
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
            <SidebarHeader className="justify-center">
                <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="text-lg font-bold tracking-wide uppercase text-[#16245e] dark:text-indigo-200">Booking Is</span>
                    <span className="text-lg font-bold tracking-wide uppercase text-[#16245e] dark:text-indigo-200">Yours</span>
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
