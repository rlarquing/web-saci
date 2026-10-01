import { api } from "./api.utility";
import { obtenerToken } from "./obtener-token.utility";

/**
 * Descarga un fichero del API (CSV de exportación, informes de conteo, etc.)
 * con autenticación por Bearer y lo entrega al navegador como descarga.
 * El API expone Content-Disposition y el blob se convierte en <a download>.
 */
export const descargarCsv = async (
    endpoint: string,
    nombreFichero: string,
    parametros?: Record<string, string>,
): Promise<void> => {
    const token = await obtenerToken();
    const query = parametros && Object.keys(parametros).length > 0
        ? '?' + new URLSearchParams(parametros).toString()
        : '';

    const respuesta = await fetch(`${api()}${endpoint}${query}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
    });

    if (!respuesta.ok) {
        throw new Error(`El servidor respondió ${respuesta.status} al exportar`);
    }

    const blob = await respuesta.blob();
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreFichero;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
};
