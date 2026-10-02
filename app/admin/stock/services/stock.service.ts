import { get } from "@/utilities";

const filas = async (endpoint: string, almacenId?: string): Promise<any[]> => {
    const data = await get(endpoint + (almacenId ? `?almacenId=${almacenId}` : ''), true);
    return Array.isArray(data.obj) ? data.obj : [];
};

/** Stock derivado por producto/almacén, enriquecido con el bin (ubicacionNombre — P3). */
export const stock = async (almacenId?: string): Promise<any[]> => {
    return filas('movimiento-inventario/stock', almacenId);
};

export const bajoMinimo = async (almacenId?: string): Promise<any[]> => {
    return filas('movimiento-inventario/bajo-minimo', almacenId);
};

export const selectAlmacenes = async (): Promise<any[]> => {
    const data = await get('nomenclador/almacen/crear/select', true);
    return Array.isArray(data.obj) ? data.obj : [];
};
