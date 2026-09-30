"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { dashboard, tendencia, comparativaAlmacenes, bajoMinimo } from "./services/bi.service";

function Kpi({ titulo, valor, tono }: { titulo: string; valor: any; tono?: string }) {
    return (
        <Card>
            <CardContent className="p-4">
                <p className="text-xs uppercase text-muted-foreground">{titulo}</p>
                <p className={`mt-1 text-2xl font-bold ${tono ?? ''}`}>{valor}</p>
            </CardContent>
        </Card>
    );
}

/** Dashboard de inventario (SACI fase 1) — consume /bi/* del API. */
export default function BiPage() {
    const [kpi, setKpi] = useState<any>(null);
    const [puntos, setPuntos] = useState<any[]>([]);
    const [almacenes, setAlmacenes] = useState<any[]>([]);
    const [alertas, setAlertas] = useState<any[]>([]);

    useEffect(() => {
        (async (): Promise<void> => {
            try {
                setKpi(await dashboard());
                setPuntos(await tendencia(14));
                setAlmacenes(await comparativaAlmacenes());
                setAlertas(await bajoMinimo());
            } catch {
                toast.error('No se pudo cargar el dashboard');
            }
        })();
    }, []);

    const maxMov = Math.max(1, ...puntos.map((p) => p.entradas + p.salidas));

    return (
        <div className="space-y-6 p-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Kpi titulo="Productos" valor={kpi?.totalProductos ?? '—'} />
                <Kpi titulo="Stock total" valor={kpi?.stockTotal ?? '—'} />
                <Kpi titulo="Entradas hoy" valor={kpi?.entradasHoy ?? '—'} tono="text-emerald-600" />
                <Kpi titulo="Salidas hoy" valor={kpi?.salidasHoy ?? '—'} tono="text-red-600" />
            </div>

            <Card>
                <CardHeader><CardTitle>Alertas de stock bajo mínimo ({alertas.length})</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {alertas.length === 0 && <span className="text-sm text-muted-foreground">Sin alertas</span>}
                    {alertas.slice(0, 12).map((a: any, i: number) => (
                        <Badge key={i} variant="destructive">
                            {a.productoCodigo} · {a.stock}/{a.stockMinimo} @ {a.almacenNombre}
                        </Badge>
                    ))}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Movimientos por día (14 días)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex h-40 items-end gap-1">
                            {puntos.map((p) => (
                                <div key={p.fecha} className="flex-1" title={`${p.fecha}: ${p.entradas}E / ${p.salidas}S`}>
                                    <div className="w-full rounded-t bg-emerald-500" style={{ height: `${(p.entradas / maxMov) * 100}%` }} />
                                    <div className="w-full rounded-b bg-red-400" style={{ height: `${(p.salidas / maxMov) * 100}%` }} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Comparativa de almacenes (30 días)</CardTitle></CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <thead><tr className="text-left text-muted-foreground"><th className="pb-2">Almacén</th><th>Entradas</th><th>Salidas</th><th>Movs.</th></tr></thead>
                            <tbody>
                                {almacenes.map((a: any) => (
                                    <tr key={a.almacenId} className="border-t">
                                        <td className="py-1">{a.almacenNombre}</td>
                                        <td>{a.entradas}</td>
                                        <td>{a.salidas}</td>
                                        <td>{a.movimientos}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
