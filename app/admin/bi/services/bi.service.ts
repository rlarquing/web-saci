import { get } from "@/utilities";

export const dashboard = async (): Promise<any> => {
    const data = await get('bi/dashboard', true);
    return data.obj ?? {};
};

export const tendencia = async (dias = 14): Promise<any[]> => {
    const data = await get(`bi/tendencia?dias=${dias}`, true);
    return data.obj?.puntos ?? [];
};

export const comparativaAlmacenes = async (): Promise<any[]> => {
    const data = await get('bi/comparativa-almacenes', true);
    return data.obj?.almacenes ?? [];
};

export const bajoMinimo = async (): Promise<any[]> => {
    const data = await get('bi/bajo-minimo', true);
    return data.obj?.alertas ?? [];
};
