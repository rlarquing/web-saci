export interface DetalleTipo {
    producto: string;
    cantidad: number;
    ingreso: number;
}

export interface RegistroDiario {
    id: string;
    fecha: string;
    almacenId: string;
    almacenNombre: string;
    estado: 'abierto' | 'cerrado';
    totalEntradas: number;
    totalSalidas: number;
    detalleCategorias: DetalleTipo[];
}
