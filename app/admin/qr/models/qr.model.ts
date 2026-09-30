/**
 * Modelo para la información de un lote de QR
 */
export interface LoteInfo {
    loteId: string;
    fechaGeneracion: Date;
    productoNombre: string;
    productoCodigo: string;
    cantidad: number;
    primerNumero: number;
    ultimoNumero: number;
}

/**
 * Modelo para leer un QR generado
 */
export interface ReadQr {
    id: string;
    codigo: string;
    numeroConsecutivo: number;
    productoId: string;
    productoNombre: string;
    productoCodigo: string;
    contenido: string;
    fechaGeneracion: Date;
    loteId: string;
    almacenId?: string;
    almacenNombre?: string;
    estado: 'disponible' | 'usado' | 'anulado';
    fechaUso?: Date;
    activo: boolean;
}

/**
 * DTO para generar QRs
 */
export interface GenerateQr {
    productoId: string;
    almacenId: string;
    cantidad: number;
}

/**
 * Respuesta de generación de QRs
 */
export interface GenerateQrResponse {
    loteId: string;
    cantidadGenerada: number;
    numeroInicial: number;
    numeroFinal: number;
    fechaGeneracion: Date;
    productoNombre: string;
    mensaje: string;
}
