import { ReadUser } from "../models";

export const UserAdapter = (obj: any): ReadUser => ({
    dtoToString: obj.dtoToString,
    id: obj.id,
    userName: obj.userName,
    email: obj.email,
    roles: obj.roles.map((item: any) => ({ label: item.nombre, value: item.id })),
    funciones: obj.funciones?.map((item: any) => ({ label: item.nombre, value: item.id })) || [],
    almacenes: obj.almacenes?.map((item: any) => ({ label: item.nombre, value: item.id })) || [],
    validacion: obj.validacion
});
