import {get, patch, post, remove} from "@/utilities";
import {funcion} from "../endpoints/function.endpoint";
import {Listado, MessageModel, SelectOption} from "@/models";
import {ListadoAdapter, SelectAdapter} from "@/adapters";
import {ReadFunction} from "../models";
import {FunctionAdapter} from "../adapters/function.adapter";
import {MessageAdapter} from "@/adapters";

export const findAll = async (limit: number, page: number): Promise<Listado> => {
    const data = await get(funcion.list, true, {limit, page});
    return ListadoAdapter(data.obj);
}

export const findById = async (id: string): Promise<ReadFunction | MessageModel> => {
    const data = await get(funcion.get.replace('{id}', `${id}`),true);

    if (data.msg.type === "error") {
        return MessageAdapter(data.msg);
    }
    return FunctionAdapter(data.obj);
}

export const create = async (body: any): Promise<MessageModel> => {
    const data = await post(funcion.new,true,null, body);
        return MessageAdapter(data.msg);
}

export const update = async (id: string, body: any): Promise<MessageModel> => {
    const data = await patch(funcion.edit.replace('{id}', `${id}`), true,null, body);
        return MessageAdapter(data.msg);
}

export const deleteFunction = async (id: string): Promise<MessageModel> => {
    const data = await remove(funcion.delete.replace('{id}', `${id}`), true);
    return MessageAdapter(data.msg);
}

export const deleteMultiple = async (ids: string[]): Promise<MessageModel> => {
    const data = await remove(funcion.delete_many, true,null,ids);
    return MessageAdapter(data.msg);
}

export const createSelectFuncion = async (): Promise<SelectOption[] | MessageModel> => {
    let selectFuncion: SelectOption[] = [];
    const data = await get(funcion.select, true);
    if (data.msg.type === "error") {
        return MessageAdapter(data.msg);
    }
    if (data.obj && data.obj.length > 0) {
        selectFuncion = data.obj.map((funcion: any) => SelectAdapter(funcion));
    }
    return selectFuncion;
}
export const search = async (search: string, limit: number, page: number): Promise<Listado> => {
    const data = await post(funcion.search, true, {limit, page}, {search});
    return ListadoAdapter(data.obj);
}
