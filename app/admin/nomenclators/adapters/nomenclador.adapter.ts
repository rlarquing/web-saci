import {ReadNomenclador} from "../models";

export const NomencladorAdapter = (obj: any):ReadNomenclador => ({
    dtoToString: obj.dtoToString,
    id: obj.id,
    nombre: obj.nombre,
    descripcion: obj.descripcion,
});
