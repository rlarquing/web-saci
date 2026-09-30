export interface Producto {
    codigo?: string;
    nombre: string;
    descripcion?: string;
    categoriaId: string;
    unidadId: string;
    stockMinimo?: number;
}

export interface ReadProducto extends Producto {
    id: string;
    codigo: string;
    categoriaNombre: string;
    unidadNombre: string;
    activo: boolean;
}
