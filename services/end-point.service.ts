import {MessageModel, SelectOption} from "../models";
import {get} from "../utilities";
import {MessageAdapter, SelectAdapter} from "../adapters";
import {publicEnpoint} from "../endpoints/public.endpoint";

export const createSelectEndPoints = async (): Promise<SelectOption[] | MessageModel> => {
    const data = await get(publicEnpoint.endPoint.select, true);
    if (data.msg.type === "error") {
        return MessageAdapter(data.msg);
    }
    return data.obj.map((endPoint: any)=>SelectAdapter(endPoint));
}
