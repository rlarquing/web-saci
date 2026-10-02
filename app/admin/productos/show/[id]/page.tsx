"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
    ArrowDownLeft,
    ArrowLeftRight,
    ArrowUpRight,
    SlidersHorizontal,
    RefreshCw,
    Plus,
    Trash2,
} from "lucide-react";
import { productos } from "../../routers/producto.router";
import { get } from "@/utilities";
import { producto } from "../../endpoints/producto.endpoint";
import { fotoUrl, selectNomenclador, variantesDe, crearVariante, actualizarAtributos, AtributoVariante } from "../../services/producto.service";
import { binsDeProducto, selectUbicaciones, asignarBin, reasignarBin, quitarBin, BinProducto } from "../../services/bin.service";
import { socketService } from "@/services/socket.service";
import { formatFechaHumana } from "@/utilities/format-date.utility";

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
    lote?: string;
    fechaCaducidad?: string;
}

const TIPO_META: Record<string, { icon: any; color: string; label: string; bg: string }> = {
    ENTRADA: { icon: ArrowDownLeft, color: "text-emerald-700", label: "Entrada", bg: "bg-emerald-100" },
    SALIDA: { icon: ArrowUpRight, color: "text-red-700", label: "Salida", bg: "bg-red-100" },
    AJUSTE: { icon: SlidersHorizontal, color: "text-amber-700", label: "Ajuste", bg: "bg-amber-100" },
    TRASLADO: { icon: ArrowLeftRight, color: "text-teal-700", label: "Traslado", bg: "bg-teal-100" },
};

/**
 * Detalle de producto con timeline de movimientos (backlog P2) más variantes
 * y bins por almacén (backlog P3). Consume GET /movimiento-inventario?productoId=…
 * y se refresca en vivo con el evento socket movimiento:change.
 */
export default function ShowProducto() {
    const router = useRouter();
    const params: any = useParams();
    const id = params?.id;
    const [prod, setProd] = useState<any>(null);
    const [filas, setFilas] = useState<FilaMovimiento[]>([]);
    const [cargando, setCargando] = useState(true);

    // Variantes (P3)
    const esVariante = Boolean(prod?.productoPadreId);
    const [variantes, setVariantes] = useState<any[]>([]);
    const [editorAbierto, setEditorAbierto] = useState(false);
    const [atributos, setAtributos] = useState<AtributoVariante[]>([{ clave: "", valor: "" }]);
    const [guardando, setGuardando] = useState(false);

    // Bins por almacén (P3)
    const [bins, setBins] = useState<BinProducto[]>([]);
    const [almacenes, setAlmacenes] = useState<any[]>([]);
    const [binAlmacenId, setBinAlmacenId] = useState("");
    const [binUbicacionId, setBinUbicacionId] = useState("");
    const [ubicaciones, setUbicaciones] = useState<any[]>([]);
    const [operandoBin, setOperandoBin] = useState(false);

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

    // Carga accesoria de variantes, bins y almacenes (P3): un fallo no bloquea la ficha.
    useEffect(() => {
        if (!id) return;
        let vigente = true;
        (async (): Promise<void> => {
            const [rVariantes, rBins, rAlmacenes] = await Promise.allSettled([
                variantesDe(id),
                binsDeProducto(id),
                selectNomenclador("almacen"),
            ]);
            if (!vigente) return;
            if (rVariantes.status === "fulfilled") setVariantes(rVariantes.value);
            if (rBins.status === "fulfilled") setBins(rBins.value);
            else toast.error("No se pudieron cargar los bins del producto");
            if (rAlmacenes.status === "fulfilled") setAlmacenes(rAlmacenes.value);
        })();
        return () => {
            vigente = false;
        };
    }, [id]);

    // Ubicaciones del combo de bins: se recargan al cambiar el almacén elegido
    // (el API filtra por almacén cuando se le pasa almacenId).
    useEffect(() => {
        if (!binAlmacenId) return;
        let vigente = true;
        (async (): Promise<void> => {
            try {
                const lista = await selectUbicaciones(binAlmacenId);
                if (vigente) setUbicaciones(lista);
            } catch {
                if (vigente) setUbicaciones([]);
            }
        })();
        return () => {
            vigente = false;
        };
    }, [binAlmacenId]);

    // Refresco en vivo cuando cualquier movimiento cambia (kardex compartido)
    useEffect(() => {
        const unsubscribe = socketService.onMovimientoChange(() => cargar());
        return () => unsubscribe();
    }, [cargar]);

    const recargarVariantes = async (): Promise<void> => {
        try {
            setVariantes(await variantesDe(id));
        } catch {
            // se conservan las variantes ya cargadas
        }
    };

    const recargarBins = async (): Promise<void> => {
        try {
            setBins(await binsDeProducto(id));
        } catch {
            // se conservan los bins ya cargados
        }
    };

    // ── Editor de atributos (crear variante o reescribir los de una variante) ──
    const abrirEditor = (): void => {
        // El ReadDto no expone los atributos actuales: se ofrecen vacíos para reescribir.
        setAtributos([{ clave: "", valor: "" }]);
        setEditorAbierto(true);
    };

    const guardarAtributos = async (): Promise<void> => {
        const limpios = atributos
            .map((a) => ({ clave: a.clave.trim(), valor: a.valor.trim() }))
            .filter((a) => a.clave !== "" && a.valor !== "");
        if (limpios.length === 0) {
            toast.error("Añade al menos un atributo con clave y valor");
            return;
        }
        setGuardando(true);
        try {
            const resp = esVariante
                ? await actualizarAtributos(id, limpios)
                : await crearVariante(id, limpios);
            if (resp.type === "success") {
                toast.success(resp.message || (esVariante ? "Atributos actualizados" : "Variante creada"));
                setEditorAbierto(false);
                setAtributos([{ clave: "", valor: "" }]);
                await recargarVariantes();
                if (esVariante) await cargar();
            } else {
                toast.error(resp.message || "Error en la operación");
            }
        } finally {
            setGuardando(false);
        }
    };

    // ── Bins por almacén ──
    const vinculoActual = bins.find((b) => b.almacenId === binAlmacenId);

    const cambiarBinAlmacen = (valor: string): void => {
        setBinAlmacenId(valor);
        setBinUbicacionId("");
        setUbicaciones([]);
    };

    const asignar = async (): Promise<void> => {
        if (!binAlmacenId || !binUbicacionId) return;
        setOperandoBin(true);
        try {
            const resp = await asignarBin(id, binAlmacenId, binUbicacionId);
            if (resp.type === "success") {
                toast.success(resp.message || "Bin asignado");
                await recargarBins();
            } else {
                toast.error(resp.message || "No se pudo asignar el bin");
            }
        } finally {
            setOperandoBin(false);
        }
    };

    const reasignar = async (): Promise<void> => {
        if (!vinculoActual || !binUbicacionId) return;
        setOperandoBin(true);
        try {
            const resp = await reasignarBin(vinculoActual.id, binUbicacionId);
            if (resp.type === "success") {
                toast.success(resp.message || "Bin reasignado");
                await recargarBins();
            } else {
                toast.error(resp.message || "No se pudo reasignar el bin");
            }
        } finally {
            setOperandoBin(false);
        }
    };

    const quitar = async (): Promise<void> => {
        if (!vinculoActual) return;
        setOperandoBin(true);
        try {
            const resp = await quitarBin(vinculoActual.id);
            if (resp.type === "success") {
                toast.success(resp.message || "Bin eliminado");
                setBinUbicacionId("");
                await recargarBins();
            } else {
                toast.error(resp.message || "No se pudo quitar el bin");
            }
        } finally {
            setOperandoBin(false);
        }
    };

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
                        {esVariante && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {prod?.atributosResumen && (
                                    <Badge variant="secondary">{prod.atributosResumen}</Badge>
                                )}
                                <Link
                                    href={productos.show.replace("[id]", prod.productoPadreId)}
                                    className="text-xs text-teal-700 hover:underline"
                                >
                                    ← padre
                                </Link>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">
                        Variantes {variantes.length > 0 && `(${variantes.length})`}
                    </CardTitle>
                    {!esVariante ? (
                        <Button variant="outline" size="sm" onClick={abrirEditor} disabled={editorAbierto}>
                            <Plus className="mr-1 h-4 w-4" /> Crear variante
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" onClick={abrirEditor} disabled={editorAbierto}>
                            Editar atributos
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-3">
                    {!esVariante && variantes.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Sin variantes. Crea combinaciones de atributos (ej. Talla: M · Color: Rojo); cada una genera
                            un SKU nuevo que hereda la categoría y la unidad del padre.
                        </p>
                    )}
                    {variantes.length > 0 && (
                        <ul className="divide-y rounded-md border">
                            {variantes.map((v) => (
                                <li key={v.id} className="flex items-center gap-3 px-3 py-2">
                                    <span className="font-mono text-xs">{v.codigo}</span>
                                    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                                        {v.atributosResumen || "—"}
                                    </span>
                                    <Link href={productos.show.replace("[id]", v.id)}>
                                        <Button variant="ghost" size="sm">Ver</Button>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                    {editorAbierto && (
                        <div className="space-y-3 rounded-md border p-3">
                            <p className="text-xs text-muted-foreground">
                                {esVariante
                                    ? "Reescribe los atributos de esta variante (se sustituyen todos los anteriores)."
                                    : "Define los atributos de la variante (ej. clave «Talla», valor «M»)."}
                            </p>
                            {atributos.map((a, i) => (
                                <div key={i} className="flex items-end gap-2">
                                    <div className="flex-1 space-y-1">
                                        <Label htmlFor={`atributo-clave-${i}`}>Atributo</Label>
                                        <Input
                                            id={`atributo-clave-${i}`}
                                            placeholder="Talla"
                                            value={a.clave}
                                            onChange={(e) =>
                                                setAtributos((prev) =>
                                                    prev.map((x, j) => (j === i ? { ...x, clave: e.target.value } : x)),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <Label htmlFor={`atributo-valor-${i}`}>Valor</Label>
                                        <Input
                                            id={`atributo-valor-${i}`}
                                            placeholder="M"
                                            value={a.valor}
                                            onChange={(e) =>
                                                setAtributos((prev) =>
                                                    prev.map((x, j) => (j === i ? { ...x, valor: e.target.value } : x)),
                                                )
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Quitar atributo ${i + 1}`}
                                        disabled={atributos.length === 1}
                                        onClick={() => setAtributos((prev) => prev.filter((_, j) => j !== i))}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            ))}
                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAtributos((prev) => [...prev, { clave: "", valor: "" }])}
                                >
                                    <Plus className="mr-1 h-4 w-4" /> Atributo
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setEditorAbierto(false)}>
                                        Cancelar
                                    </Button>
                                    <Button size="sm" onClick={guardarAtributos} disabled={guardando}>
                                        {guardando ? "Guardando…" : esVariante ? "Guardar atributos" : "Crear variante"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Ubicaciones (bins)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                        Dónde encontrar el producto dentro de cada almacén: un bin activo por producto y almacén.
                    </p>
                    {bins.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sin bins asignados todavía.</p>
                    ) : (
                        <ul className="divide-y rounded-md border">
                            {bins.map((b) => (
                                <li key={b.id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
                                    <span className="font-medium">{b.almacenNombre}</span>
                                    <span className="text-muted-foreground">→</span>
                                    <Badge variant="outline">{b.ubicacionNombre}</Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="space-y-2 rounded-md border p-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="bin-almacen">Almacén</Label>
                                <select
                                    id="bin-almacen"
                                    className="w-full rounded-md border p-2"
                                    value={binAlmacenId}
                                    onChange={(e) => cambiarBinAlmacen(e.target.value)}
                                >
                                    <option value="">Seleccione…</option>
                                    {almacenes.map((a) => (
                                        <option key={a.value} value={a.value}>{a.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="bin-ubicacion">Bin (ubicación)</Label>
                                <select
                                    id="bin-ubicacion"
                                    className="w-full rounded-md border p-2"
                                    value={binUbicacionId}
                                    onChange={(e) => setBinUbicacionId(e.target.value)}
                                    disabled={!binAlmacenId}
                                >
                                    <option value="">Seleccione…</option>
                                    {ubicaciones.map((u) => (
                                        <option key={u.value} value={u.value}>{u.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {vinculoActual ? (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    Bin actual en {vinculoActual.almacenNombre}: {vinculoActual.ubicacionNombre}
                                </span>
                                <Button
                                    size="sm"
                                    onClick={reasignar}
                                    disabled={!binUbicacionId || binUbicacionId === vinculoActual.ubicacionId || operandoBin}
                                >
                                    Reasignar
                                </Button>
                                <Button size="sm" variant="outline" onClick={quitar} disabled={operandoBin}>
                                    Quitar
                                </Button>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                onClick={asignar}
                                disabled={!binAlmacenId || !binUbicacionId || operandoBin}
                            >
                                Asignar
                            </Button>
                        )}
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
                            const diasCaducidad = m.fechaCaducidad
                                ? dayjs(m.fechaCaducidad).startOf("day").diff(dayjs().startOf("day"), "day")
                                : null;
                            const claseCaducidad =
                                diasCaducidad !== null && diasCaducidad < 0
                                    ? "border-red-300 text-red-700"
                                    : diasCaducidad !== null && diasCaducidad <= 30
                                        ? "border-amber-300 text-amber-700"
                                        : "";
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
                                        {m.lote && (
                                            <Badge variant="outline" className="text-[10px]">
                                                Lote: {m.lote}
                                            </Badge>
                                        )}
                                        {m.fechaCaducidad && (
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] ${claseCaducidad}`}
                                            >
                                                vence {formatFechaHumana(m.fechaCaducidad)}
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
