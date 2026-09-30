"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { stock, bajoMinimo, selectAlmacenes } from "./services/stock.service";
import { toast } from "sonner";

const DataTable = dynamic(
  () => import("@/components/DataTable/data-table.component").then(mod => mod.DataTable),
  { ssr: false, loading: () => <div>Cargando...</div> }
);

export default function StockPage() {
    const [filas, setFilas] = useState<any>({});
    const [alertas, setAlertas] = useState<any[]>([]);
    const [almacenes, setAlmacenes] = useState<any[]>([]);
    const [almacenId, setAlmacenId] = useState('');

    useEffect(() => {
        (async (): Promise<void> => {
            setAlmacenes(await selectAlmacenes());
        })();
    }, []);

    useEffect(() => {
        (async (): Promise<void> => {
            try {
                const rows = await stock(almacenId || undefined);
                setFilas({ data: rows });
                setAlertas(await bajoMinimo(almacenId || undefined));
            } catch {
                toast.error('No se pudo cargar el stock');
            }
        })();
    }, [almacenId]);

    return (
        <div className="space-y-6 p-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Alertas de stock bajo mínimo</CardTitle>
                    <select className="rounded-md border p-2" value={almacenId} onChange={(e) => setAlmacenId(e.target.value)}>
                        <option value="">Todos los almacenes</option>
                        {almacenes.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {alertas.length === 0 && <span className="text-sm text-muted-foreground">Sin alertas 🎉</span>}
                    {alertas.map((a, i) => (
                        <Badge key={i} variant="destructive">
                            {a.productoCodigo} {a.productoNombre} · {a.stock}/{a.stockMinimo} @ {a.almacenNombre}
                        </Badge>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Stock actual (derivado de movimientos)</CardTitle></CardHeader>
                <CardContent>
                    <DataTable
                        title={'Stock'}
                        data={filas}
                        headerBackground='#f3f0f2'
                        headerColor='#0f766e'
                    />
                </CardContent>
            </Card>
        </div>
    );
}
