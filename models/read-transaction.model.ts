import {ReadActivePerson} from "./read-active-person.model";

export interface ReadTransaction {
    dtoToString: string;
    id: number;
    tipoPago: string,
    banco: string,
    fecha: string,
    monto: 1,
    numeroReferencia: string,
    capturaPago: string,
    person: ReadActivePerson,
}
