import { get, post, remove, patch } from "@/utilities";
import { qr } from "../endpoints/qr.endpoint";
import { LoteInfo, ReadQr, GenerateQrResponse } from "../models";

/**
 * Obtiene todos los lotes de QR generados
 * El endpoint devuelve { items: [...], meta: {...} }
 */
export const getLotes = async (): Promise<any[]> => {
    const data = await get(qr.lotes, true);
    // Extraer el array de items directamente
    if (data.obj?.items) return data.obj.items;
    if (Array.isArray(data.obj)) return data.obj;
    return [];
}

/**
 * Genera un nuevo lote de QRs
 * El almacenId es obligatorio y debe ser uno de los almacenes asignados al usuario
 */
export const generateQrs = async (
    producto: string,
    cantidad: number,
    almacen: string
): Promise<GenerateQrResponse | null> => {
    const body = {
        producto,
        cantidad,
        almacen,
    };
    const data = await post(qr.generar, true, null, body);
    if (data.msg?.type === "error") {
        return null;
    }
    return data.obj;
}

/**
 * Obtiene los QRs de un lote específico
 */
export const getQrsByLote = async (loteId: string): Promise<ReadQr[]> => {
    const ruta = qr.findByLote.replace('{loteId}', loteId);
    const data = await get(ruta, true);
    return data.obj || [];
}

/**
 * Obtiene la URL del PDF para descargar
 */
export const getPdfUrl = (loteId: string): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
    const token = getTokenFromCookie();
    const ruta = qr.pdf.replace('{loteId}', loteId);
    return `${apiUrl}/${ruta}?token=${token}`;
}

/**
 * Obtiene token desde cookie para autenticación
 */
const getTokenFromCookie = (): string => {
    if (typeof document === 'undefined') return '';
    const userLoggedStr = getObjCookie('userLogged');
    if (userLoggedStr && typeof userLoggedStr === 'string') {
        try {
            const user = JSON.parse(userLoggedStr);
            return user?.token || '';
        } catch {
            return '';
        }
    }
    return '';
}

// Importación necesaria
import { getObjCookie } from "@/utilities";

/**
 * Obtiene la cantidad de QRs disponibles por tipo de medio
 */
export const countDisponibles = async (productoId: string): Promise<number> => {
    const ruta = qr.disponibles.replace('{productoId}', productoId);
    const data = await get(ruta, true);
    return data.obj?.cantidad || 0;
}

/**
 * Obtiene todos los QRs (paginado)
 */
export const getAllQrs = async (page: number = 1, limit: number = 10): Promise<any> => {
    const data = await get(`${qr.list}?page=${page}&limit=${limit}`, true);
    return data.obj;
}

/**
 * Elimina un QR por su ID
 */
export const deleteQr = async (id: string): Promise<any> => {
    const ruta = qr.delete.replace('{id}', id);
    return await remove(ruta, true);
}

/**
 * Elimina múltiples QRs por sus IDs
 */
export const deleteMultipleQrs = async (ids: string[]): Promise<any> => {
    return await remove(qr.deleteMultiple, true, null, ids);
}

/**
 * Elimina un lote completo de QRs
 */
export const deleteLote = async (loteId: string): Promise<any> => {
    const ruta = qr.deleteLote.replace('{loteId}', loteId);
    return await remove(ruta, true);
}

/**
 * Anula un QR por su ID
 */
export const anularQr = async (id: string): Promise<any> => {
    const ruta = qr.anular.replace('{id}', id);
    return await patch(ruta, true, null, {});
}

/**
 * Anula múltiples QRs por sus IDs
 */
export const anularMultipleQrs = async (ids: string[]): Promise<any> => {
    return await patch(qr.anularMultiple, true, null, ids);
}
