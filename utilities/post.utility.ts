import { hacerPeticion } from "./hacer-peticion.utility";
import { api } from "./api.utility";
import { formatValidationErrors } from "./format-validation-errors.utility";

export const post = async (endpoint: string, necesitaToken: boolean = false, parametros?: any, bodyParams?: any, otrasOpciones?: any): Promise<any> => {
    let msg = {}; //MENSAJES
    let obj = {}; //OBJETOS
    let response = null;

    try {
        response = await hacerPeticion(api() + endpoint, 'POST', necesitaToken, bodyParams, parametros, otrasOpciones);

        if (!response) {
            // Sin respuesta del servidor (red caída, proxy, etc.)
            msg = {
                statusCode: 500,
                type: "error",
                message: "No se pudo conectar con el servidor",
            };
        } else if (response.hasOwnProperty("successStatus")) {
            if (response.successStatus === true) {
                msg = {
                    statusCode: 200,
                    type: "success",
                    message: `Acción realizada correctamente.`,
                };
            } else {
                msg = {
                    statusCode: 400,
                    type: "error",
                    message: formatValidationErrors(response.message),
                };
            }
            obj = response;
        } else if (typeof response.statusCode === "number" && response.statusCode >= 400) {
            // Cuerpo de error de NestJS: validación, no encontrado, error interno
            msg = {
                statusCode: response.statusCode,
                type: "error",
                message: formatValidationErrors(response.message),
            };
        } else if (response.accessToken) {
            obj = response;
        } else {
            obj = response;
        }
    } catch (error: any) {
        if (error.message && (error.message.indexOf(" 400") !== -1 || error.message.indexOf(" 403") !== -1 || error.message.indexOf(" 500") !== -1)) {
            msg = {
                statusCode: error.response?.statusCode || 400,
                type: "error",
                message: formatValidationErrors(error.response?.message),
            };
        }
    }
    return { msg, obj };
}