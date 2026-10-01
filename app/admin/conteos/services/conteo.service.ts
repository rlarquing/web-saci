import { get, post, hacerPeticion, api } from "@/utilities";
import { conteo } from "../endpoints/conteo.endpoint";
import { Listado, MessageModel } from "@/models";
import { ListadoAdapter, MessageAdapter } from "@/adapters";

/**
 * Mapea el ResponseDto del API ({id, successStatus, message}) al
 * MessageModel del frontend conservando el mensaje real (p.ej.
 * "Conteo cerrado: 3 ajuste(s) generado(s)…"), que los adaptadores
 * genéricos sustituirían por un texto fijo.
 */
const mapRespuesta = (response: any): MessageModel => {
    if (!response) {
        return { statusCode: 500, type: "error", message: "No se pudo conectar con el servidor" };
    }
    if (response.successStatus === true) {
        return { statusCode: 200, type: "success", message: response.message || "Operación correcta" };
    }
    return { statusCode: 400, type: "error", message: response.message || "Error en la operación" };
};

export const findAll = async (
    limit: number,
    page: number,
    estado?: string,
): Promise<Listado> => {
    const params: Record<string, any> = { limit, page };
    if (estado) params.estado = estado;
    const data = await get(conteo.list, true, params);
    return ListadoAdapter(data.obj);
};

/** Detalle de un conteo con todas sus líneas (ReadConteoDto). */
export const obtener = async (id: string): Promise<any> => {
    const data = await get(conteo.get.replace("{id}", id), true);
    return data?.obj ?? null;
};

export const crear = async (body: { almacenId: string; esCiego: boolean }): Promise<{ resp: MessageModel; id?: string }> => {
    const data = await post(conteo.new, true, null, body);
    return { resp: MessageAdapter(data.msg), id: data?.obj?.id };
};

export const contar = async (id: string, body: { productoId: string; cantidadContada: number }): Promise<MessageModel> => {
    const response = await hacerPeticion(api() + conteo.linea.replace("{id}", id), "PUT", true, body);
    return mapRespuesta(response);
};

export const cerrar = async (id: string): Promise<MessageModel> => {
    const response = await hacerPeticion(api() + conteo.cerrar.replace("{id}", id), "PATCH", true, null);
    return mapRespuesta(response);
};

export const cancelar = async (id: string): Promise<MessageModel> => {
    const response = await hacerPeticion(api() + conteo.cancelar.replace("{id}", id), "PATCH", true, null);
    return mapRespuesta(response);
};
