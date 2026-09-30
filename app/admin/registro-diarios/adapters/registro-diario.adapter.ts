import { RegistroDiario } from "../models/registro-diario.model";
import dayjs from "dayjs";
import 'dayjs/locale/es-us';

/**
 * Adaptador para transformar la respuesta del API de registro-diario al modelo del frontend.
 *
 * El API devuelve ReadRegistroDiarioDto con estos campos:
 *   id, fecha, almacen (objeto con nombre), estado, totalEntradas, totalSalidas, detalleCategorias
 */
export const RegistroDiarioAdapter = (obj: any): RegistroDiario => ({
    id: obj.id,
    fecha: obj.fecha ? dayjs(obj.fecha).locale('es-us').format('DD/MM/YYYY') : '',
    almacenId: obj.almacenId ?? obj.almacen?.id ?? '',
    almacenNombre: obj.almacen?.nombre ?? obj.almacenNombre ?? '',
    estado: obj.estado ?? 'abierto',
    totalEntradas: obj.totalEntradas ?? 0,
    totalSalidas: obj.totalSalidas ?? 0,
    detalleCategorias: obj.detalleCategorias ?? [],
});
