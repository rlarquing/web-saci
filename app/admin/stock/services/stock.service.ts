import { get } from "@/utilities";

export const stock = async (almacenId?: string): Promise<any[]> => {
    const data = await get('movimiento-inventario/stock' + (almacenId ? `?almacenId=${almacenId}` : ''), true);
    return data.obj ?? [];
};

export const bajoMinimo = async (almacenId?: string): Promise<any[]> => {
    const data = await get('movimiento-inventario/bajo-minimo' + (almacenId ? `?almacenId=${almacenId}` : ''), true);
    return data.obj ?? [];
};

export const selectAlmacenes = async (): Promise<any[]> => {
    const data = await get('nomenclador/almacen/crear/select', true);
    return data.obj ?? [];
};
