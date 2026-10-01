import { get, post, patch, remove } from "@/utilities";
import { nivelStock } from "../endpoints/nivel-stock.endpoint";
import { Listado, MessageModel } from "@/models";
import { ListadoAdapter, MessageAdapter } from "@/adapters";

/**
 * Mapea el ResponseDto del API ({id, successStatus, message}) al
 * MessageModel del frontend conservando el mensaje real (p.ej.
 * "Ya existe un nivel para PRD-000001 en Central…").
 */
const mapRespuesta = (response: any): MessageModel => {
    if (!response) {
        return { statusCode: 500, type: "error", message: "No se pudo conectar con el servidor" };
    }
    if (response.successStatus === true) {
        return { statusCode: 200, type: "success", message: response.message || "Operación correcta" };
    }
    return { statusCode: 400, type: "error", message: response.message || "Error en la operación" };
};

export const findAll = async (
    limit: number,
    page: number,
    almacenId?: string,
): Promise<Listado> => {
    const params: Record<string, any> = { limit, page };
    if (almacenId) params.almacenId = almacenId;
    const data = await get(nivelStock.list, true, params);
    return ListadoAdapter(data.obj);
};

export const findById = async (id: string): Promise<any> => {
    const data = await get(nivelStock.get.replace("{id}", id), true);
    return data.obj;
};

export const create = async (body: any): Promise<MessageModel> => {
    const data = await post(nivelStock.new, true, null, body);
    return mapRespuesta(data?.msg ?? data);
};

export const update = async (id: string, body: any): Promise<MessageModel> => {
    const data = await patch(nivelStock.edit.replace("{id}", id), true, null, body);
    return mapRespuesta(data?.msg ?? data);
};

export const eliminar = async (id: string): Promise<MessageModel> => {
    const data = await remove(nivelStock.delete.replace("{id}", id), true);
    return mapRespuesta(data?.msg?.successStatus !== undefined ? data.msg : data?.obj ?? data?.msg);
};

/** Almacenes para el filtro y el alta (nomenclador). */
export const selectAlmacenes = async (): Promise<any[]> => {
    const data = await get("nomenclador/almacen/crear/select", true);
    return data.obj ?? [];
};

/** Búsqueda de productos para el alta del nivel (reusa el buscar de productos). */
export const buscarProductos = async (buscar: string): Promise<any[]> => {
    const data = await get("producto/buscar", true, { buscar, limit: 10, page: 1 });
    return data?.obj?.data?.items ?? [];
};
