import { get, patch, post, remove } from "@/utilities";
import { Listado, MessageModel, SelectOption } from "@/models";
import { menu } from "../endpoints/menu.endpoint";
import { ListadoAdapter, SelectAdapter } from "@/adapters";
import { ReadMenu } from "../models";
import { MessageAdapter } from "@/adapters";
import { MenuAdapter } from "../adapters/menu.adapter";

export const tipoMenu = async (tipo: string): Promise<ReadMenu[]> => {
    const data = await get(menu.tipo.replace('{tipo}', tipo), false);
    return data.obj.map((menu: any) => MenuAdapter(menu));
}

export const findAll = async (limit: number, page: number): Promise<Listado> => {
    const data = await get(menu.list, true, {limit, page});
    return ListadoAdapter(data.obj);
}

export const findById = async (id: string): Promise<ReadMenu | MessageModel> => {
    const data = await get(menu.get.replace('{id}', `${id}`), true);
    if (data.msg.type === "error") {
        return MessageAdapter(data.msg);
    }
    return MenuAdapter(data.obj);
}

export const create = async (body: any): Promise<MessageModel> => {
    const data = await post(menu.new,true, null, body);
        return MessageAdapter(data.msg);
}

export const update = async (id: string, body: any): Promise<MessageModel> => {
    const data = await patch(menu.edit.replace('{id}', `${id}`), true,null, body);
        return MessageAdapter(data.msg);
}

export const deleteMenu = async (id: string): Promise<MessageModel> => {
    const data = await remove(menu.delete.replace('{id}', `${id}`), true);
        return MessageAdapter(data.msg);
}

export const deleteMultiple = async (ids: string[]): Promise<MessageModel> => {
    const data = await remove(menu.delete_many, true, null, ids);
        return MessageAdapter(data.msg);
}

export const createSelectMenus = async (): Promise<SelectOption[] | MessageModel> => {
    let selectMenu: SelectOption[] = [];
    const data = await get(menu.select, true);
    if (data.msg.type === "error") {
        return MessageAdapter(data.msg);
    }
    if (data.obj && data.obj.length > 0) {
        selectMenu = data.obj.map((menu: any) => SelectAdapter(menu));
    }
    return selectMenu;
}
export const search = async (search: string, limit: number, page: number): Promise<Listado> => {
    const data = await post(menu.search, true, {limit, page}, {search});
    return ListadoAdapter(data.obj);
}