import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__main/inbox')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__main/inbox"!</div>
}
