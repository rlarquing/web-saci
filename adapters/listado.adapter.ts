import {Listado} from "@/models";

export const ListadoAdapter = (obj: any): Listado => {
    // Si obj es undefined o null, retornar estructura vacía
    if (!obj) {
        return {
            header: [],
            key: [],
            data: { items: [] },
        };
    }

    // Manejar diferentes estructuras de respuesta del API
    const dataObj = obj?.data || obj;
    const items = dataObj?.items || dataObj || [];
    
    if (!items || (Array.isArray(items) && items.length === 0)) {
        return {
            header: obj?.header || [],
            key: obj?.key || [],
            data: { items: [] },
        };
    }

    for (const item of items) {
        for (const key in item) {
            if (typeof item[key] === 'object') {
                if (Array.isArray(item[key])) {
                    item[key] = item[key].length > 0
                        ? item[key].map((a: any) => a.dtoToString).toString()
                        : '';
                } else {
                    item[key] = item[key].dtoToString;
                }

            }
            if (typeof item[key] === 'boolean') {
                if (item[key] === true) {
                    item[key] = 'Si';
                } else {
                    item[key] = 'No';
                }
            }
        }
    }
    return {
        header: obj?.header || [],
        key: obj?.key || [],
        data: {
            items,
            meta: obj?.data?.meta,
        },
    }
};
