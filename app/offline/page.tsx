import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sin conexión - SACI',
}

export default function OfflinePage() {
    return (
        <main className='flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center'>
            <h1 className='text-2xl font-semibold'>Sin conexión</h1>
            <p className='text-muted-foreground max-w-sm'>
                No pudimos conectar con el servidor. Revisá tu conexión: la aplicación se recupera sola
                cuando vuelva.
            </p>
        </main>
    )
}
