import {get, post, remove} from "@/utilities";
import {logHistory} from "../endpoints/log-history.endpoint";
import {Listado, MessageModel} from "@/models";
import {ListadoAdapter, MessageAdapter} from "@/adapters";
import {LogHistory} from "../models/log-history.model";
import {LogHistoryAdapter} from "../adapters/log-history.adapter";

export const findAll = async (limit: number, page: number): Promise<Listado> => {
    const data = await get(logHistory.list, true, {limit, page});
    data.obj.data.items = data.obj.data.items.map((item: any) => (LogHistoryAdapter(item)));
    return ListadoAdapter(data.obj);
}

export const findById = async (id: string): Promise<LogHistory | MessageModel> => {
    const data = await get(logHistory.get.replace('{id}', `${id}`), true);
    if (data.msg.type === "error") {
        return MessageAdapter(data.msg);
    }
    return LogHistoryAdapter(data.obj);
}

export const deleteTraza = async (id: string): Promise<MessageModel> => {
    const data = await remove(logHistory.delete.replace('{id}', `${id}`), true);
    return MessageAdapter(data.msg);

}

export const filtrar = async (body: any): Promise<MessageModel> => {
    const data = await post(logHistory.filter, true, null, body);
    return MessageAdapter(data.msg);
}

export const search = async (search: string, limit: number, page: number): Promise<Listado> => {
    const data = await post(logHistory.search, true, {limit, page}, {search});
    data.obj.data.items = data.obj.data.items.map((item: any) => (LogHistoryAdapter(item)));
    return ListadoAdapter(data.obj);
}
