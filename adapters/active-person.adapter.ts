import {ReadActivePerson} from "../models";
import dayjs from 'dayjs';

export const ActivePersonAdapter = (obj: any): ReadActivePerson => {
    const fechaNacimiento:string = dayjs(obj.fechaNacimiento).format('DD/MM/YYYY');
    return {
    dtoToString: obj.dtoToString,
    id: obj.id,
    tipoDocumento: obj.tipoDocumento,
    dni: obj.dni,
    nombres: obj.nombres,
    apellidos: obj.apellidos,
    fechaNacimiento,
    sexo: obj.sexo,
    telefono: obj.telefono,
    fotoPerfil: obj.fotoPerfil,
    fotoDni: obj.fotoDni,
    user: obj.user.dtoToString,
}};
