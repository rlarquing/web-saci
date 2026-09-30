import {ReadFunction} from "../../functions/models/read-function.model";
import {SelectOption} from "@/models";

export interface ReadRol {
    dtoToString: string;
    id: string;
    nombre: string;
    descripcion: string;
    users: SelectOption[]
    funciones: ReadFunction[];
}
