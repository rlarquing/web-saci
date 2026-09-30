import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

// Fechas de negocio (listados, vigencia de precios): "18/08/2026"
// Usa la parte de calendario literal del ISO (sin conversión de zona horaria),
// porque la fecha se guarda como medianoche UTC y en hora local retrocedería un día.
export function formatFechaHumana(value: string | Date | null | undefined): string {
    if (!value) return "";
    const raw = typeof value === "string" ? value : value.toISOString();
    const datePart = raw.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        const [y, m, d] = datePart.split("-");
        return `${d}/${m}/${y}`;
    }
    return String(value);
}

// Eventos puntuales (generación de lotes QR): "18/08/2026 10:30"
// Aquí sí se convierte a hora local: es un instante real, no una fecha de calendario.
export function formatFechaHumanaConHora(value: string | Date | null | undefined): string {
    if (!value) return "";
    const d = dayjs(value);
    if (!d.isValid()) return String(value);
    return d.format("DD/MM/YYYY HH:mm");
}