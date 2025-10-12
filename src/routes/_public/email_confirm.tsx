import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/email_confirm')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Enviamos un mail para que confirmes tu cuenta. Por favor revisa tu bandeja de entrada!</div>
}
