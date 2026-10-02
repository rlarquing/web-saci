"use client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { descargarCsv } from "@/utilities";
import { formatFechaHumana } from "@/utilities/format-date.utility";
import { lote } from "./endpoints/lote.endpoint";
import { listar, selectAlmacenes, LoteFila } from "./services/lote.service";

const DIAS_OPCIONES = ["15", "30", "60", "90"];

const ESTADO_META: Record<string, { variante: "destructive" | "secondary" | "outline"; clase: string; etiqueta: string }> = {
    VENCIDO: { variante: "destructive", clase: "", etiqueta: "VENCIDO" },
    PROXIMO: { variante: "secondary", clase: "bg-amber-100 text-amber-800", etiqueta: "PRÓXIMO" },
    OK: { variante: "outline", clase: "border-emerald-300 text-emerald-700", etiqueta: "OK" },
    SIN_CADUCIDAD: { variante: "outline", clase: "text-muted-foreground", etiqueta: "SIN CADUCIDAD" },
};

/**
 * Stock por lote con estado de caducidad (backlog P3).
 * Consume GET /movimiento-inventario/lotes con filtros por almacén y ventana de días.
 */
export default function LotesPage() {
    const [filas, setFilas] = useState<LoteFila[]>([]);
    const [almacenes, setAlmacenes] = useState<any[]>([]);
    const [almacenId, setAlmacenId] = useState("");
    const [diasProximo, setDiasProximo] = useState("30");
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        (async (): Promise<void> => {
            setAlmacenes(await selectAlmacenes());
        })();
    }, []);

    useEffect(() => {
        (async (): Promise<void> => {
            setCargando(true);
            try {
                setFilas(await listar(almacenId || undefined, Number(diasProximo)));
            } catch (e: any) {
                toast.error(e?.message || "No se pudo cargar el stock por lote");
            } finally {
                setCargando(false);
            }
        })();
    }, [almacenId, diasProximo]);

    const exportar = async (): Promise<void> => {
        try {
            const parametros: Record<string, string> = { diasProximo };
            if (almacenId) parametros.almacenId = almacenId;
            await descargarCsv(lote.exportar, "lotes-caducidad.csv", parametros);
        } catch (e: any) {
            toast.error(e?.message || "Error al exportar los lotes");
        }
    };

    return (
        <div className="space-y-6 p-2">
            <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
                    <CardTitle>Lotes y vencimientos</CardTitle>
                    <div className="flex flex-wrap items-end gap-2">
                        <div className="space-y-1">
                            <Label htmlFor="lotes-almacen">Almacén</Label>
                            <select
                                id="lotes-almacen"
                                className="rounded-md border p-2"
                                value={almacenId}
                                onChange={(e) => setAlmacenId(e.target.value)}
                            >
                                <option value="">Todos los almacenes</option>
                                {almacenes.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="lotes-dias">Avisar con</Label>
                            <select
                                id="lotes-dias"
                                className="rounded-md border p-2"
                                value={diasProximo}
                                onChange={(e) => setDiasProximo(e.target.value)}
                            >
                                {DIAS_OPCIONES.map((d) => <option key={d} value={d}>{d} días</option>)}
                            </select>
                        </div>
                        <Button variant="outline" onClick={exportar}>
                            <Download className="mr-1 h-4 w-4" /> Exportar CSV
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="mb-3 text-xs text-muted-foreground">
                        Stock por lote con fecha de caducidad. Los vencidos se listan primero; «PRÓXIMO» avanza según la
                        ventana elegida.
                    </p>
                    <div className="max-h-96 overflow-y-auto rounded-md border">
                        <Table>
                            <TableHeader className="sticky top-0 bg-[#f3f0f2]">
                                <TableRow>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Almacén</TableHead>
                                    <TableHead>Lote</TableHead>
                                    <TableHead>Caducidad</TableHead>
                                    <TableHead className="text-right">Días para vencer</TableHead>
                                    <TableHead className="text-right">Stock</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filas.map((f, i) => {
                                    const meta = ESTADO_META[f.estado] ?? ESTADO_META.SIN_CADUCIDAD;
                                    return (
                                        <TableRow key={`${f.productoId}-${f.almacenNombre}-${f.lote ?? "s/lote"}-${i}`}>
                                            <TableCell className="font-mono text-xs">{f.productoCodigo}</TableCell>
                                            <TableCell className="max-w-[240px] truncate" title={f.productoNombre}>
                                                {f.productoNombre}
                                            </TableCell>
                                            <TableCell>{f.almacenNombre}</TableCell>
                                            <TableCell className="font-mono text-xs">{f.lote || "(sin lote)"}</TableCell>
                                            <TableCell>{f.fechaCaducidad ? formatFechaHumana(f.fechaCaducidad) : "—"}</TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {f.diasParaVencer ?? "—"}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">{f.stock}</TableCell>
                                            <TableCell>
                                                <Badge variant={meta.variante} className={meta.clase}>
                                                    {meta.etiqueta}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {!cargando && filas.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                                            Sin lotes registrados con los filtros actuales.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {cargando && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                                            Cargando…
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <RefreshCw className={`h-3 w-3 ${cargando ? "animate-spin" : ""}`} />
                        {filas.length} lote(s) con stock
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
