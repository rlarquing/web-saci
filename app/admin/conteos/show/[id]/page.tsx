"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/confirm-dialog.component";
import { toast } from "sonner";
import { CheckCircle2, Download, Search, XCircle } from "lucide-react";
import { obtener, contar, cerrar, cancelar } from "../../services/conteo.service";
import { descargarCsv } from "@/utilities";

interface LineaConteo {
    productoId: string;
    productoCodigo: string;
    productoNombre: string;
    cantidadEsperada: number;
    cantidadContada: number | null;
    stockAlCierre: number | null;
    diferencia: number | null;
    ajusteId: string | null;
}

interface Conteo {
    id: string;
    almacenId: string;
    almacenNombre: string;
    userName: string;
    estado: string;
    esCiego: boolean;
    fechaApertura?: string;
    fechaCierre?: string;
    lineas: LineaConteo[];
    resumen?: {
        sobrantes?: number;
        faltantes?: number;
        ajustesGenerados?: number;
        errores?: Array<{ productoCodigo: string; error: string }>;
    } | null;
    totalLineas: number;
    totalContadas: number;
}

export default function DetalleConteo() {
    const params: any = useParams();
    const id = params?.id as string;

    const [conteo, setConteo] = useState<Conteo | null>(null);
    const [edicion, setEdicion] = useState<Record<string, string>>({});
    const [guardandoLinea, setGuardandoLinea] = useState<string | null>(null);
    const [operando, setOperando] = useState(false);
    const [confirmarCierre, setConfirmarCierre] = useState(false);
    const [confirmarCancelar, setConfirmarCancelar] = useState(false);
    const [busqueda, setBusqueda] = useState("");

    const cargar = useCallback(async (): Promise<void> => {
        const data = await obtener(id);
        setConteo(data);
        const inicial: Record<string, string> = {};
        for (const l of data?.lineas ?? []) {
            inicial[l.productoId] = l.cantidadContada === null ? "" : String(l.cantidadContada);
        }
        setEdicion(inicial);
    }, [id]);

    useEffect(() => {
        if (id) (async (): Promise<void> => { await cargar(); })();
    }, [id, cargar]);

    const abierto = conteo?.estado === "ABIERTO";
    const ocultarEsperado = Boolean(conteo?.esCiego && abierto);

    const lineasFiltradas = useMemo(() => {
        const lineas = conteo?.lineas ?? [];
        if (!busqueda.trim()) return lineas;
        const q = busqueda.trim().toLowerCase();
        return lineas.filter(
            (l) => l.productoCodigo.toLowerCase().includes(q) || l.productoNombre.toLowerCase().includes(q),
        );
    }, [conteo, busqueda]);

    const guardarLinea = async (linea: LineaConteo): Promise<void> => {
        const valor = edicion[linea.productoId] ?? "";
        if (valor === "") {
            toast.error("Introduce la cantidad contada");
            return;
        }
        const cantidad = Number(valor);
        if (!Number.isFinite(cantidad) || cantidad < 0) {
            toast.error("Cantidad inválida");
            return;
        }
        setGuardandoLinea(linea.productoId);
        try {
            const resp = await contar(id, { productoId: linea.productoId, cantidadContada: cantidad });
            if (resp.type === "success") {
                toast.success(resp.message || "Cantidad registrada");
                await cargar();
            } else {
                toast.error(resp.message || "No se pudo registrar");
            }
        } finally {
            setGuardandoLinea(null);
        }
    };

    const ejecutarCerrar = async (): Promise<void> => {
        setOperando(true);
        try {
            const resp = await cerrar(id);
            if (resp.type === "success") {
                toast.success(resp.message || "Conteo cerrado");
                await cargar();
            } else {
                toast.error(resp.message || "No se pudo cerrar el conteo");
            }
        } finally {
            setOperando(false);
            setConfirmarCierre(false);
        }
    };

    const ejecutarCancelar = async (): Promise<void> => {
        setOperando(true);
        try {
            const resp = await cancelar(id);
            if (resp.type === "success") {
                toast.success(resp.message || "Conteo cancelado");
                await cargar();
            } else {
                toast.error(resp.message || "No se pudo cancelar");
            }
        } finally {
            setOperando(false);
            setConfirmarCancelar(false);
        }
    };

    const exportar = async (): Promise<void> => {
        try {
            await descargarCsv(`conteo-inventario/${id}/exportar`, `conteo-${id}.csv`);
        } catch (e: any) {
            toast.error(e?.message || "Error al descargar el informe");
        }
    };

    if (!conteo) {
        return <div className="p-6 text-sm text-muted-foreground">Cargando conteo…</div>;
    }

    const progreso = conteo.totalLineas > 0 ? Math.round((conteo.totalContadas / conteo.totalLineas) * 100) : 0;

    return (
        <div className="space-y-4 p-2">
            <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            Conteo · {conteo.almacenNombre}
                            <Badge variant={abierto ? "default" : conteo.estado === "CERRADO" ? "secondary" : "destructive"}>
                                {conteo.estado}
                            </Badge>
                            {conteo.esCiego && <Badge variant="outline">A ciegas</Badge>}
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Abierto por {conteo.userName}
                            {conteo.fechaApertura ? ` · ${new Date(conteo.fechaApertura).toLocaleString()}` : ""}
                            {conteo.fechaCierre ? ` · cerrado ${new Date(conteo.fechaCierre).toLocaleString()}` : ""}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {conteo.estado === "CERRADO" && (
                            <Button variant="outline" onClick={exportar}>
                                <Download className="mr-1 h-4 w-4" /> Informe CSV
                            </Button>
                        )}
                        {abierto && (
                            <>
                                <Button variant="outline" onClick={() => setConfirmarCancelar(true)} disabled={operando}>
                                    <XCircle className="mr-1 h-4 w-4" /> Cancelar
                                </Button>
                                <Button onClick={() => setConfirmarCierre(true)} disabled={operando || conteo.totalContadas < conteo.totalLineas}>
                                    <CheckCircle2 className="mr-1 h-4 w-4" /> Cerrar conteo
                                </Button>
                            </>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-[#0f766e] transition-all" style={{ width: `${progreso}%` }} />
                        </div>
                        <span className="text-sm font-medium">
                            {conteo.totalContadas}/{conteo.totalLineas} contadas
                        </span>
                    </div>
                    {conteo.estado === "CERRADO" && conteo.resumen && (
                        <div className="flex flex-wrap gap-2 text-sm">
                            <Badge variant="secondary">Sobrantes: {conteo.resumen.sobrantes ?? 0}</Badge>
                            <Badge variant="secondary">Faltantes: {conteo.resumen.faltantes ?? 0}</Badge>
                            <Badge>Ajustes generados: {conteo.resumen.ajustesGenerados ?? 0}</Badge>
                            {(conteo.resumen.errores ?? []).length > 0 && (
                                <Badge variant="destructive">
                                    Sin ajustar: {(conteo.resumen.errores ?? []).length}
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Líneas del conteo</CardTitle>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar SKU o nombre"
                            className="pl-8"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[60vh] overflow-y-auto rounded-md border">
                        <Table>
                            <TableHeader className="sticky top-0 bg-[#f3f0f2]">
                                <TableRow>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-right">Esperado</TableHead>
                                    <TableHead className="text-right">Contado</TableHead>
                                    <TableHead className="text-right">Diferencia</TableHead>
                                    {abierto && <TableHead className="w-24">Acción</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lineasFiltradas.map((linea) => {
                                    const diferenciaVisible = !ocultarEsperado && linea.diferencia !== null;
                                    return (
                                        <TableRow key={linea.productoId}>
                                            <TableCell className="font-mono text-xs">{linea.productoCodigo}</TableCell>
                                            <TableCell className="max-w-[220px] truncate" title={linea.productoNombre}>
                                                {linea.productoNombre}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {ocultarEsperado ? "—" : linea.cantidadEsperada}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {abierto ? (
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        className="ml-auto h-8 w-24 text-right tabular-nums"
                                                        value={edicion[linea.productoId] ?? ""}
                                                        onChange={(e) =>
                                                            setEdicion((prev) => ({ ...prev, [linea.productoId]: e.target.value }))
                                                        }
                                                    />
                                                ) : (
                                                    <span className="tabular-nums">{linea.cantidadContada ?? "—"}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {diferenciaVisible ? (
                                                    <span className={linea.diferencia! > 0 ? "text-green-600" : linea.diferencia! < 0 ? "text-red-600" : ""}>
                                                        {linea.diferencia! > 0 ? "+" : ""}
                                                        {linea.diferencia}
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </TableCell>
                                            {abierto && (
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={guardandoLinea === linea.productoId}
                                                        onClick={() => guardarLinea(linea)}
                                                    >
                                                        {guardandoLinea === linea.productoId ? "…" : "Guardar"}
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                                {lineasFiltradas.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={abierto ? 6 : 5} className="text-center text-sm text-muted-foreground">
                                            Sin resultados
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={confirmarCierre}
                onOpenChange={setConfirmarCierre}
                title="¿Cerrar el conteo?"
                description="Se comparará lo contado contra el stock real y se generarán ajustes auditables por cada diferencia. No se puede deshacer."
                confirmText="Cerrar conteo"
                onConfirm={ejecutarCerrar}
            />
            <ConfirmDialog
                open={confirmarCancelar}
                onOpenChange={setConfirmarCancelar}
                title="¿Cancelar el conteo?"
                description="Se descartarán las cantidades contadas sin generar ajustes."
                confirmText="Cancelar conteo"
                destructive
                onConfirm={ejecutarCancelar}
            />
        </div>
    );
}
