import { get, post, patch, remove, hacerPeticion, api } from "@/utilities";
import { producto } from "../endpoints/producto.endpoint";
import { Listado, MessageModel } from "@/models";
import { ListadoAdapter, MessageAdapter } from "@/adapters";

export const findAll = async (limit: number, page: number): Promise<Listado> => {
    const data = await get(producto.list, true, { limit, page });
    return ListadoAdapter(data.obj);
};

export const search = async (buscar: string, limit: number, page: number): Promise<Listado> => {
    const data = await get(producto.search, true, { buscar, limit, page });
    return ListadoAdapter(data.obj);
};

export const create = async (body: any): Promise<MessageModel> => {
    const data = await post(producto.new, true, null, body);
    return MessageAdapter(data.msg);
};

export const update = async (id: string, body: any): Promise<MessageModel> => {
    const data = await patch(producto.edit.replace("{id}", id), true, null, body);
    return MessageAdapter(data.msg);
};

export const deleteMultiple = async (ids: string[]): Promise<MessageModel> => {
    const data = await remove(producto.delete_many, true, null, ids);
    return MessageAdapter(data.msg);
};

/** Catálogo dinámico (almacen|categoria|unidad|ubicacion) para combos. */
export const selectNomenclador = async (nombre: string): Promise<any[]> => {
    const data = await get(`nomenclador/${nombre}/crear/select`, true);
    return data.obj ?? [];
};

/** Sube/actualiza la foto (data URL comprimida en cliente) de un producto. */
export const subirFoto = async (id: string, foto: string): Promise<MessageModel> => {
    const response = await hacerPeticion(api() + `producto/${id}/foto`, 'PUT', true, { foto });
    if (!response) {
        return { statusCode: 500, type: 'error', message: 'No se pudo conectar con el servidor' };
    }
    if (response.successStatus === true) {
        return { statusCode: 200, type: 'success', message: response.message || 'Foto actualizada' };
    }
    return { statusCode: 400, type: 'error', message: response.message || 'Error al subir la foto' };
};

/** URL pública de la foto (endpoint sin autenticación del API). */
export const fotoUrl = (id: string): string => `${api()}producto-foto/${id}`;
