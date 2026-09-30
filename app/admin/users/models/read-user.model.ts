import {SelectOption} from "@/models";

export interface ReadUser{
    dtoToString: string;
    id: string;
    userName: string;
    email: string;
    roles: SelectOption[];
    funciones: SelectOption[];
    almacenes: SelectOption[];
    validacion: boolean;
}
