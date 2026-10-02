import { get } from "@/utilities";
import { lote } from "../endpoints/lote.endpoint";

/** Fila de stock por lote con estado de caducidad (backlog P3). */
export interface LoteFila {
    productoId: string;
    productoCodigo: string;
    productoNombre: string;
    almacenNombre: string;
    lote: string | null;
    fechaCaducidad: string | null;
    stock: number;
    estado: "VENCIDO" | "PROXIMO" | "OK" | "SIN_CADUCIDAD";
    diasParaVencer: number | null;
}

/**
 * Stock derivado por lote con estado VENCIDO/PROXIMO/OK/SIN_CADUCIDAD.
 * El API solo devuelve filas con stock > 0, ordenadas vencidos → próximos → OK → sin caducidad.
 */
export const listar = async (
    almacenId?: string,
    diasProximo?: number,
): Promise<LoteFila[]> => {
    const parametros: Record<string, string> = {};
    if (almacenId) parametros.almacenId = almacenId;
    if (diasProximo && diasProximo > 0) parametros.diasProximo = String(diasProximo);
    const data = await get(lote.list, true, Object.keys(parametros).length > 0 ? parametros : undefined);
    if (data?.msg?.type === "error") {
        throw new Error(data.msg.message || "No se pudo cargar el stock por lote");
    }
    return Array.isArray(data?.obj) ? data.obj : [];
};

/** Almacenes para el filtro (nomenclador). */
export const selectAlmacenes = async (): Promise<any[]> => {
    const data = await get("nomenclador/almacen/crear/select", true);
    return Array.isArray(data?.obj) ? data.obj : [];
};
