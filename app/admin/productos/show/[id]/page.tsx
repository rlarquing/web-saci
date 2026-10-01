"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
    ArrowDownLeft,
    ArrowLeftRight,
    ArrowUpRight,
    SlidersHorizontal,
    RefreshCw,
} from "lucide-react";
import { productos } from "../../routers/producto.router";
import { get } from "@/utilities";
import { producto } from "../../endpoints/producto.endpoint";
import { fotoUrl } from "../../services/producto.service";
import { socketService } from "@/services/socket.service";

interface FilaMovimiento {
    id: string;
    tipo: "ENTRADA" | "SALIDA" | "AJUSTE" | "TRASLADO";
    productoCodigo: string;
    productoNombre: string;
    cantidad: number;
    almacenNombre: string;
    almacenDestinoNombre?: string;
    qrCodigo?: string;
    userName: string;
    fecha: string;
    saldoResultante?: number;
    observaciones?: string;
    signoAjuste?: number;
}

const TIPO_META: Record<string, { icon: any; color: string; label: string; bg: string }> = {
    ENTRADA: { icon: ArrowDownLeft, color: "text-emerald-700", label: "Entrada", bg: "bg-emerald-100" },
    SALIDA: { icon: ArrowUpRight, color: "text-red-700", label: "Salida", bg: "bg-red-100" },
    AJUSTE: { icon: SlidersHorizontal, color: "text-amber-700", label: "Ajuste", bg: "bg-amber-100" },
    TRASLADO: { icon: ArrowLeftRight, color: "text-teal-700", label: "Traslado", bg: "bg-teal-100" },
};

/**
 * Detalle de producto con timeline de movimientos (backlog P2).
 * Consume GET /movimiento-inventario?productoId=… (nuevo filtro del kardex)
 * y se refresca en vivo con el evento socket movimiento:change.
 */
export default function ShowProducto() {
    const router = useRouter();
    const params: any = useParams();
    const id = params?.id;
    const [prod, setProd] = useState<any>(null);
    const [filas, setFilas] = useState<FilaMovimiento[]>([]);
    const [cargando, setCargando] = useState(true);

    const cargar = useCallback(async () => {
        if (!id) return;
        setCargando(true);
        try {
            const dataProd = await get(producto.get.replace("{id}", id), true);
            setProd(dataProd?.obj ?? null);
            const dataMov = await get(
                `movimiento-inventario?productoId=${id}&limit=100`,
                true,
            );
            const items = dataMov?.obj?.items ?? dataMov?.obj ?? [];
            setFilas(Array.isArray(items) ? items : []);
        } catch {
            toast.error("No se pudo cargar el historial del producto");
        } finally {
            setCargando(false);
        }
    }, [id]);

    // Primera carga: inline con await antes de cualquier setState (evita
    // el setState síncrono en el cuerpo del efecto que marca el lint).
    useEffect(() => {
        let vigente = true;
        (async (): Promise<void> => {
            if (!id) return;
            try {
                const dataProd = await get(producto.get.replace("{id}", id), true);
                const dataMov = await get(
                    `movimiento-inventario?productoId=${id}&limit=100`,
                    true,
                );
                if (!vigente) return;
                setProd(dataProd?.obj ?? null);
                const items = dataMov?.obj?.items ?? dataMov?.obj ?? [];
                setFilas(Array.isArray(items) ? items : []);
            } catch {
                if (vigente) toast.error("No se pudo cargar el historial del producto");
            } finally {
                if (vigente) setCargando(false);
            }
        })();
        return () => {
            vigente = false;
        };
    }, [id]);

    // Refresco en vivo cuando cualquier movimiento cambia (kardex compartido)
    useEffect(() => {
        const unsubscribe = socketService.onMovimientoChange(() => cargar());
        return () => unsubscribe();
    }, [cargar]);

    return (
        <div className="mx-auto max-w-3xl space-y-5 p-2">
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => router.push(productos.index)}>
                    Volver
                </Button>
                <Button variant="outline" onClick={() => cargar()} disabled={cargando}>
                    <RefreshCw className={`mr-1 h-4 w-4 ${cargando ? "animate-spin" : ""}`} />
                    Refrescar
                </Button>
            </div>

            <Card>
                <CardContent className="flex items-center gap-4 p-4">
                    {prod?.hasFoto ? (
                        <img
                            src={fotoUrl(id)}
                            alt={`Foto de ${prod?.nombre ?? "producto"}`}
                            className="h-16 w-16 rounded-lg border object-cover"
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground">
                            sin foto
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold">
                            {prod?.codigo} · {prod?.nombre}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {prod?.categoriaNombre} · {prod?.unidadNombre}
                            {prod?.descripcion ? ` — ${prod.descripcion}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Punto de reorden global:{" "}
                            <b>
                                {(prod?.stockMinimo ?? 0) + (prod?.stockSeguridad ?? 0)}
                            </b>{" "}
                            (mínimo {prod?.stockMinimo ?? 0} + seguridad{" "}
                            {prod?.stockSeguridad ?? 0})
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Timeline de movimientos {filas.length > 0 && `(${filas.length})`}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filas.length === 0 && !cargando && (
                        <p className="text-sm text-muted-foreground">
                            Sin movimientos registrados para este producto.
                        </p>
                    )}
                    <ol className="relative ml-3 space-y-5 border-l-2 border-muted pl-6">
                        {filas.map((m) => {
                            const meta = TIPO_META[m.tipo] ?? TIPO_META.ENTRADA;
                            const Icon = meta.icon;
                            const esAjusteNeg = m.tipo === "AJUSTE" && m.signoAjuste === -1;
                            return (
                                <li key={m.id} className="relative">
                                    <span
                                        className={`absolute -left-[37px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white ${meta.bg}`}
                                    >
                                        <Icon className={`h-4 w-4 ${meta.color}`} />
                                    </span>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`text-sm font-semibold ${meta.color}`}>
                                            {meta.label}
                                        </span>
                                        <span className="text-sm">
                                            {m.tipo === "SALIDA" || esAjusteNeg ? "-" : "+"}
                                            {m.cantidad}
                                            {m.tipo === "AJUSTE" &&
                                                ` (${m.signoAjuste === -1 ? "faltante" : "sobrante"})`}
                                        </span>
                                        {m.saldoResultante !== undefined &&
                                            m.saldoResultante !== null && (
                                                <Badge variant="outline" className="text-[10px]">
                                                    saldo: {m.saldoResultante}
                                                </Badge>
                                            )}
                                        {m.almacenDestinoNombre && (
                                            <Badge variant="outline" className="text-[10px]">
                                                → {m.almacenDestinoNombre}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {dayjs(m.fecha).format("DD/MM/YYYY HH:mm")} · {m.almacenNombre}
                                        {m.userName ? ` · ${m.userName}` : ""}
                                        {m.qrCodigo ? ` · QR ${m.qrCodigo}` : ""}
                                    </p>
                                    {m.observaciones && (
                                        <p className="mt-0.5 text-xs italic text-muted-foreground">
                                            “{m.observaciones}”
                                        </p>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </CardContent>
            </Card>
        </div>
    );
}
