import {get, patch, post, remove} from "@/utilities";
import {rol} from "../endpoints/rol.endpoint";
import {Listado, MessageModel, SelectOption} from "@/models";
import {ListadoAdapter, SelectAdapter} from "@/adapters";
import {ReadRol} from "../models";
import {RolAdapter} from "../adapters/rol.adapter";
import {MessageAdapter} from "@/adapters";

export const findAll = async (limit: number, page: number): Promise<Listado> => {
    const data = await get(rol.list, true, {limit, page});
    return ListadoAdapter(data.obj);
}

export const findById = async (id: string): Promise<ReadRol | MessageModel> => {
    const data = await get(rol.get.replace('{id}', `${id}`), true);
    if (data.msg.type === "error") {
        return MessageAdapter(data.msg);
    }
    return RolAdapter(data.obj);
}

export const create = async (body: any): Promise<MessageModel> => {
    const data = await post(rol.new, true, null, body);
        return MessageAdapter(data.msg);
}

export const update = async (id: string, body: any): Promise<MessageModel> => {
    const data = await patch(rol.edit.replace('{id}', `${id}`), true, null, body);
        return MessageAdapter(data.msg);
}

export const deleteRol = async (id: string): Promise<MessageModel> => {
    const data = await remove(rol.delete.replace('{id}', `${id}`), true);
        return MessageAdapter(data.msg);
}

export const deleteMultiple = async (ids: string[]): Promise<MessageModel> => {
    const data = await remove(rol.delete_many, true, null, ids);
        return MessageAdapter(data.msg);
}

export const createSelectRol = async (): Promise<SelectOption[] | MessageModel> => {
    let selectRol: SelectOption[] = [];
    const data = await get(rol.select, true);
    if (data.msg.type === "error") {
        return MessageAdapter(data.msg);
    }
    if (data.obj && data.obj.length > 0) {
        selectRol = data.obj.map((rol: any) => SelectAdapter(rol));
    }
    return selectRol;
}

export const search = async (search: string, limit: number, page: number): Promise<Listado> => {
    const data = await post(rol.search, true, {limit, page}, {search});
    return ListadoAdapter(data.obj);
}
