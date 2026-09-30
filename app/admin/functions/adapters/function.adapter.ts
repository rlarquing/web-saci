import {ReadFunction} from "../models";

export const FunctionAdapter = (obj: any): ReadFunction => ({
    dtoToString: obj.dtoToString,
    id: obj.id,
    nombre: obj.nombre,
    descripcion: obj.descripcion,
    endPoints: obj.endPoints.map((item: any)=>({label:item.nombre, value:item.id})),
    menu: obj.menu === undefined ? undefined : obj.menu.id,
});
