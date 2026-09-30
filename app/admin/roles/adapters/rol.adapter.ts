import {ReadRol} from "../models";

export const RolAdapter = (obj: any): ReadRol => ({
    dtoToString: obj.dtoToString,
    id: obj.id,
    nombre: obj.nombre,
    descripcion: obj.descripcion,
    users: obj.users?.map((u: any) => ({label: u.nombre ?? u.label ?? '', value: u.id ?? u.value ?? ''})) || [],
    funciones: obj.funciones?.map((item: any)=>({label:item.nombre, value:item.id})) || [],
});
