export const qrRoutes = {
    list: '/admin/qr',
    lotes: '/admin/qr/lotes',
    generar: '/admin/qr/generar',
    lote: '/admin/qr/lote/[loteId]',
    pdf: '/admin/qr/pdf/[loteId]',
};

/**
 * Reemplaza parámetros en las rutas
 */
export const getQrLoteRoute = (loteId: string): string => {
    return `/admin/qr/lote/${loteId}`;
};
