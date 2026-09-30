import {MessageModel} from "../models";


export const MessageAdapter = (obj: any): MessageModel => ({
        statusCode: obj.statusCode,
        type: obj.type,
        message: obj.message,
});
