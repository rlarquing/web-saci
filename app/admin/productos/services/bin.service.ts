import { get, post, remove, hacerPeticion, api } from "@/utilities";
import { productoUbicacion } from "../endpoints/bin.endpoint";
import { MessageModel } from "@/models";

/** Vínculo producto→bin (ubicación interna dentro de un almacén — backlog P3). */
export interface BinProducto {
    id: string;
    productoId: string;
    productoCodigo: string;
    productoNombre: string;
    almacenId: string;
    almacenNombre: string;
    ubicacionId: string;
    ubicacionNombre: string;
    activo: boolean;
}

/** Bins de un producto en todos sus almacenes. */
export const binsDeProducto = async (productoId: string): Promise<BinProducto[]> => {
    const data = await get(productoUbicacion.por_producto.replace("{id}", productoId), true);
    if (data?.msg?.type === "error") {
        throw new Error(data.msg.message || "No se pudieron cargar los bins del producto");
    }
    return Array.isArray(data?.obj) ? data.obj : [];
};

/** Ubicaciones activas para el combo (el API filtra por almacén si se indica). */
export const selectUbicaciones = async (almacenId?: string): Promise<any[]> => {
    const data = await get(productoUbicacion.select_ubicaciones, true, almacenId ? { almacenId } : undefined);
    if (data?.msg?.type === "error") {
        throw new Error(data.msg.message || "No se pudieron cargar las ubicaciones");
    }
    return Array.isArray(data?.obj) ? data.obj : [];
};

const mapMensaje = (response: any, exitoPorDefecto: string): MessageModel => {
    if (!response) {
        return { statusCode: 500, type: "error", message: "No se pudo conectar con el servidor" };
    }
    if (response.successStatus === true) {
        return { statusCode: 200, type: "success", message: response.message || exitoPorDefecto };
    }
    return { statusCode: 400, type: "error", message: response.message || "Error en la operación" };
};

/** Asigna un bin a un producto en un almacén (1 activo por producto+almacén). */
export const asignarBin = async (
    productoId: string,
    almacenId: string,
    ubicacionId: string,
): Promise<MessageModel> => {
    const data = await post(productoUbicacion.list, true, null, { productoId, almacenId, ubicacionId });
    if (data?.msg?.type === "error") return data.msg;
    return mapMensaje(data?.obj, "Bin asignado");
};

/** Reasigna la ubicación (bin) de un vínculo existente. */
export const reasignarBin = async (id: string, ubicacionId: string): Promise<MessageModel> => {
    const response = await hacerPeticion(api() + productoUbicacion.edit.replace("{id}", id), "PUT", true, { ubicacionId });
    return mapMensaje(response, "Bin reasignado");
};

/** Quita el bin de un producto (soft-delete en el API). */
export const quitarBin = async (id: string): Promise<MessageModel> => {
    const data = await remove(productoUbicacion.edit.replace("{id}", id), true);
    if (data?.msg?.type) return data.msg;
    return { statusCode: 500, type: "error", message: data?.msg?.message || "No se pudo eliminar el bin" };
};
