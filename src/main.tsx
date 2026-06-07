import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { PendingComp } from '@/components/ui/pending-comp'
import { ErrorComp } from '@/components/ui/error-comp'
import { NotFoundComp } from '@/components/ui/not-found-comp'

const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: PendingComp,
    defaultErrorComponent: ErrorComp,
    defaultNotFoundComponent: NotFoundComp,
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(<RouterProvider router={router} />)
}
