import { get, patch, post, remove } from "@/utilities";
import { user } from "../endpoints/user.endpoint";
import { Listado, MessageModel, SelectOption } from "@/models";
import { ListadoAdapter, SelectAdapter } from "@/adapters";
import { ReadUser } from "../models";
import { UserAdapter } from "../adapters/user.adapter";
import { MessageAdapter } from "@/adapters";

export const findAll = async (limit: number, page: number): Promise<Listado> => {
    const data = await get(user.list, true, {limit, page});
    return ListadoAdapter(data.obj);
}

export const findById = async (id: string): Promise<ReadUser | MessageModel> => {
    const data = await get(user.get.replace('{id}', `${id}`), true);
    if (data.msg.type === "error") {
        return MessageAdapter(data.msg);
    }
    return UserAdapter(data.obj);
}

export const create = async (body: any): Promise<MessageModel> => {
    const data = await post(user.new, true, null, body);
    return MessageAdapter(data.msg);
}

export const update = async (id: string, body: any): Promise<MessageModel> => {
    const data = await patch(user.edit.replace('{id}', `${id}`), true, null, body);
    return MessageAdapter(data.msg);
}

export const deleteUser = async (id: string): Promise<MessageModel> => {
    const data = await remove(user.delete.replace('{id}', `${id}`), true);
    return MessageAdapter(data.msg);
}

export const deleteMultiple = async (ids: string[]): Promise<MessageModel> => {
    const data = await remove(user.delete_many, true, null, ids);
    return MessageAdapter(data.msg);
}

export const changePassword = async (body: any): Promise<MessageModel> => {
    const data = await patch(user.change_password, true, null, body);
    return MessageAdapter(data.msg);
}
export const createSelectUsers = async (): Promise<SelectOption[] | MessageModel> => {
    let selectUser:SelectOption[] = []
    const data = await get(user.select, true);
    if (data.msg?.type === "error") {
        return MessageAdapter(data.msg);
    }
    if (data.obj && Array.isArray(data.obj) && data.obj.length > 0) {
        selectUser = data.obj.map((user: any) => SelectAdapter(user));
    }
    return selectUser;
}
export const search = async (search:string, limit: number, page: number): Promise<Listado> => {
    const data = await post(user.search, true, {limit, page},{search});
    return ListadoAdapter(data.obj);
}
