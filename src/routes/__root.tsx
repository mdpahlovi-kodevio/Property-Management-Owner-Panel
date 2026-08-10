import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Toaster } from '@/components/ui/sonner'
import { CompactModeProvider } from '@/lib/compact-mode'
import { ThemeProvider } from 'next-themes'

import '@/lib/i18n'
import '../styles.css'

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" storageKey="app-theme" disableTransitionOnChange>
            <CompactModeProvider>
                <Outlet />
                <Toaster />
                <TanStackDevtools
                    config={{
                        position: 'bottom-right',
                    }}
                    plugins={[
                        {
                            name: 'TanStack Router',
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                    ]}
                />
            </CompactModeProvider>
        </ThemeProvider>
    )
}
