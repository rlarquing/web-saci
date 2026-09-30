import {get, patch, post, remove} from "@/utilities";
import {nomenclador} from "../endpoints/nomenclator.endpoint";
import {Listado, MessageModel, SelectOption} from "@/models";
import {ListadoAdapter, SelectAdapter} from "@/adapters";
import {MessageAdapter} from "@/adapters";
import {ReadNomenclador} from "../models";
import {NomencladorAdapter} from "../adapters/nomenclador.adapter";

export const findAll = async (name: string, limit: number, page: number): Promise<Listado> => {
    const ruta: string = nomenclador.list.replace('{name}', name);
    const data = await get(ruta, true, {limit, page});
    console.log(data.obj);
    return ListadoAdapter(data.obj);
}

export const findById = async (name: string, id: string): Promise<ReadNomenclador | MessageModel> => {
    let ruta: string = nomenclador.get.replace('{name}', name);
    ruta = ruta.replace('{id}', id);
    const data = await get(ruta, true);
    if (data.msg.type === "error") {
        return MessageAdapter(data.msg);
    }
    return NomencladorAdapter(data.obj);
}

export const create = async (name: string, body: any): Promise<MessageModel> => {
    const ruta: string = nomenclador.new.replace('{name}', name);
    const data = await post(ruta, true,null, body);
    return MessageAdapter(data.msg);
}

export const update = async (name: string, id: string, body: any): Promise<MessageModel> => {
    let ruta: string = nomenclador.edit.replace('{name}', name);
    ruta = ruta.replace('{id}', id);
    const data = await patch(ruta, true, null, body);
    return MessageAdapter(data.msg);
}

export const deleteNomenclador = async (name: string, id: string): Promise<MessageModel> => {
    let ruta: string = nomenclador.delete.replace('{name}', name);
    ruta = ruta.replace('{id}', id);
    const data = await remove(ruta, true);
    return MessageAdapter(data.msg);

}

export const deleteMultiple = async (name: string, ids: string[]): Promise<MessageModel> => {
    const ruta: string = nomenclador.delete_many.replace('{name}', name);
    const data = await remove(ruta, true, null,ids);
    return MessageAdapter(data.msg);
}

export const createSelect = async (name: string): Promise<SelectOption[] | MessageModel> => {
    let selectNomenclador: SelectOption[] = [];
    const ruta: string = nomenclador.select.replace('{name}', name);
    const data = await get(ruta, false);
    if (data.msg.type === "error") {
        return MessageAdapter(data.msg);
    }
    if (data.obj && data.obj.length > 0) {
        selectNomenclador = data.obj.map((nom: any) => SelectAdapter(nom));
    }
    return selectNomenclador;
}
export const search = async (name: string, search: string, limit: number, page: number): Promise<Listado> => {
    const ruta: string = nomenclador.search.replace('{name}', name);
    const data = await post(ruta, true, {limit, page}, {search});
    return ListadoAdapter(data.obj);
}