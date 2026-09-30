import {LogHistory} from "../models/log-history.model";
import dayjs from "dayjs";
import 'dayjs/locale/es-us';

/**
 * Adaptador para las trazas del API de log-history.
 *
 * El API devuelve LogHistoryDto con estos campos:
 *   id, user, date, tabla, valorNuevo, valorAnterior,
 *   registroId, direccionIp, action
 *
 * NOTA: 'user' es el nombre del usuario (no userId).
 *       El API no devuelve email.
 */
export const LogHistoryAdapter = (obj: any): LogHistory => ({
    id: obj.id,
    user: obj.user ?? '',                 // El API ahora devuelve user = nombre del usuario
    date: dayjs(obj.date).locale('es-us').format('LLLL'),
    model: obj.tabla ?? '',
    data: obj.valorNuevo,
    previousData: obj.valorAnterior,
    action: obj.action ?? '',
    record: obj.registroId ?? '',
    direccionIp: obj.direccionIp ?? '',
});
