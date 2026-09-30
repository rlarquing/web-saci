import {hacerPeticion} from "./hacer-peticion.utility";
import {api} from "./api.utility";

export const remove=async (endpoint: string, necesitaToken:boolean = false, parametros?: any, bodyParams?: any, otrasOpciones?: any):Promise<any>=> {
    let msg = {}; //MENSAJES
    let response = null;
    let message: string = "";
    try {
        response= await hacerPeticion(api() + endpoint, 'DELETE', necesitaToken, bodyParams, parametros, otrasOpciones);
        if (response?.hasOwnProperty("successStatus")) {
            if (response.successStatus === true) {
                msg = {
                    statusCode: 200,
                    type: "success",
                    message: bodyParams === undefined
                        ? `Registro eliminado correctamente.`
                        : `Registros eliminados correctamente.`,
                };
            } else {
                msg = { statusCode: 500, type: "error", message: response.message || "Error interno del servidor" };
            }
        } else if (response?.statusCode && response.statusCode >= 400) {
            msg = {
                statusCode: response.statusCode,
                type: "error",
                message: Array.isArray(response.message)
                    ? response.message.map((m: any) => typeof m === "string" ? m : m?.constraints ? Object.values(m.constraints).join(", ") : JSON.stringify(m)).join(". ")
                    : response.message || "Error del servidor",
            };
        } else if (response) {
            // Response exists but no successStatus/error status — assume success
            msg = {
                statusCode: 200,
                type: "success",
                message: bodyParams === undefined
                    ? `Registro eliminado correctamente.`
                    : `Registros eliminados correctamente.`,
            };
        }
    } catch (error: any) {
        if (error.message && (error.message.indexOf(" 400") !== -1 || error.message.indexOf(" 403") !== -1 || error.message.indexOf(" 500") !== -1)) {
            message = error.response?.message || error.message;
            msg = { statusCode: error.response?.statusCode || 500, type: "error", message };
        } else {
            msg = { statusCode: 500, type: "error", message: error.message || "Error de conexión al servidor" };
        }
    }
    return {msg};
}
