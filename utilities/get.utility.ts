import {hacerPeticion} from "./hacer-peticion.utility";
import {api} from "./api.utility";
import {formatValidationErrors} from "./format-validation-errors.utility";

export const get = async (endpoint: string, necesitaToken: boolean = false, parametros?: any, otrasOpciones?: any): Promise<any> => {
    let msg = {};
    let obj = {};
    try {
        obj = await hacerPeticion(api() + endpoint, 'GET', necesitaToken, null, parametros, otrasOpciones);
    } catch (error: any) {
        const responseData = error.response?.data || error.response;
        if (responseData) {
            msg = {
                statusCode: responseData.statusCode || 400,
                type: "error",
                message: formatValidationErrors(responseData.message),
            };
        }
    }
    return {msg, obj};
}