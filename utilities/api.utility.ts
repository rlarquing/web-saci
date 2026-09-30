

export const api = () => {
    // NEXT_PUBLIC_* se inyecta en el bundle del CLIENTE en build time.
    // API_URL queda para el servidor. Orden: pública primero, fallback API_URL.
    return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
};