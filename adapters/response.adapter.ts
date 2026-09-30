import {Response} from "../models";

export const ResponseAdapter = (obj: any): Response => {
    if (obj.data.id !== undefined) {
        return {
            id: obj.data.id,
            successStatus: obj.data.successStatus,
            message: obj.data.message,
        };
    }
    return {
        successStatus: obj.data.successStatus,
        message: obj.data.message,
    };
};
