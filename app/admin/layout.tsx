import '../globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Template } from "./components";

export const metadata: Metadata = {
  title: 'SACI - Administración',
  description: 'Panel de administración del Sistema Automatizado de Control de Almacenes',
}

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Template title={'Administración'}>
        {children}
      </Template>
    </>
  )
}
