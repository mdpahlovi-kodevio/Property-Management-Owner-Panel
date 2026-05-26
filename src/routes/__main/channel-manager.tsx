import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__main/channel-manager')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__main/channel-manager"!</div>
}
