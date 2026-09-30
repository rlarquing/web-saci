import { get, post, patch } from "@/utilities";
import { registroDiarioEndpoints } from "../endpoints/registro-diario.endpoint";
import { Listado, MessageModel } from "@/models";
import { ListadoAdapter, MessageAdapter } from "@/adapters";
import { RegistroDiario } from "../models/registro-diario.model";
import { RegistroDiarioAdapter } from "../adapters/registro-diario.adapter";

/**
 * Obtener listado paginado de registros diarios (solo ADMINISTRADOR)
 */
export const findAll = async (limit: number, page: number): Promise<Listado> => {
    const data = await get(registroDiarioEndpoints.list, true, { limit, page });
    data.obj.data.items = data.obj.data.items.map((item: any) => RegistroDiarioAdapter(item));
    return ListadoAdapter(data.obj);
};

/**
 * Buscar registros diarios por texto libre
 */
export const search = async (searchText: string, limit: number, page: number): Promise<Listado> => {
    const data = await post(registroDiarioEndpoints.search, true, { limit, page }, { search: searchText });
    data.obj.data.items = data.obj.data.items.map((item: any) => RegistroDiarioAdapter(item));
    return ListadoAdapter(data.obj);
};

/**
 * Filtrar registros diarios por campos específicos
 */
export const filtrar = async (clave: string[], valor: any[], limit: number, page: number): Promise<Listado> => {
    const data = await post(registroDiarioEndpoints.filter, true, { limit, page }, { clave, valor });
    data.obj.data.items = data.obj.data.items.map((item: any) => RegistroDiarioAdapter(item));
    return ListadoAdapter(data.obj);
};

/**
 * Obtener un registro diario por ID
 */
export const findById = async (id: string): Promise<RegistroDiario | MessageModel> => {
    const ruta = registroDiarioEndpoints.get.replace('{id}', id);
    const data = await get(ruta, true);
    if (data.msg.type === "error") {
        return MessageAdapter(data.msg);
    }
    return RegistroDiarioAdapter(data.obj);
};

/**
 * Cerrar un registro diario manualmente
 */
export const cerrarRegistro = async (id: string): Promise<MessageModel> => {
    const ruta = registroDiarioEndpoints.cerrar.replace('{id}', id);
    const data = await patch(ruta, true, null, {});
    return MessageAdapter(data.msg);
};
