import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__auth')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <main className="flex-1 flex items-center justify-center">
            <Outlet />
        </main>
    )
}
