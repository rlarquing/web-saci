import { get, post } from "@/utilities";
import { movimiento } from "../endpoints/movimiento.endpoint";
import { Listado, MessageModel } from "@/models";
import { ListadoAdapter, MessageAdapter } from "@/adapters";

export const findAll = async (limit: number, page: number): Promise<Listado> => {
    const data = await get(movimiento.list, true, { limit, page });
    return ListadoAdapter(data.obj);
};

const registrar = async (endpoint: string, body: any): Promise<MessageModel> => {
    const data = await post(endpoint, true, null, body);
    return MessageAdapter(data.msg);
};

export const entrada = async (body: any) => registrar(movimiento.entrada, body);
export const salida = async (body: any) => registrar(movimiento.salida, body);
export const ajuste = async (body: any) => registrar(movimiento.ajuste, body);
export const traslado = async (body: any) => registrar(movimiento.traslado, body);
