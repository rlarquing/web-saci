import {SelectOption} from "@/models";

export interface ReadFunction {
    dtoToString: string;
    id: string;
    nombre: string;
    descripcion: string;
    endPoints: SelectOption[];
    menu?: string;
}
