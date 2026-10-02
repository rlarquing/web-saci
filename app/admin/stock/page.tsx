"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { stock, bajoMinimo, selectAlmacenes } from "./services/stock.service";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { descargarCsv } from "@/utilities";
import { createColumns } from "@/components/DataTable/data-table.component";

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
                setFilas(rows);
                setAlertas(await bajoMinimo(almacenId || undefined));
            } catch {
                toast.error('No se pudo cargar el stock');
            }
        })();
    }, [almacenId]);

    // Columnas explícitas: el API devuelve un array plano (sin header/key), así
    // que hay que declararlas aquí. El bin (ubicacionNombre) llega desde el P3.
    const columns = [
        ...createColumns(
            ['productoCodigo', 'productoNombre', 'almacenNombre', 'stock'],
            ['SKU', 'Producto', 'Almacén', 'Stock'],
        ),
        {
            accessorKey: 'ubicacionNombre',
            header: 'Bin',
            cell: ({ row }: { row: any }) => row.original.ubicacionNombre || '—',
        },
    ];

    return (
        <div className="space-y-6 p-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Alertas de stock (punto de reorden)</CardTitle>
                    <select className="rounded-md border p-2" value={almacenId} onChange={(e) => setAlmacenId(e.target.value)}>
                        <option value="">Todos los almacenes</option>
                        {almacenes.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                </CardHeader>
                <CardContent>
                    {alertas.length === 0 && <span className="text-sm text-muted-foreground">Sin alertas 🎉</span>}
                    <div className="flex flex-col gap-2">
                        {alertas.map((a, i) => (
                            <div key={i} className="flex flex-wrap items-center gap-2 rounded-md border px-3 py-2">
                                <Badge variant={a.estado === "BAJO_MINIMO" ? "destructive" : "secondary"}>
                                    {a.estado === "BAJO_MINIMO" ? "BAJO MÍNIMO" : "REORDEN"}
                                </Badge>
                                <span className="text-sm font-medium">{a.productoCodigo} {a.productoNombre}</span>
                                <span className="text-sm text-muted-foreground">
                                    stock {a.stock} · reorden {a.puntoReorden ?? a.stockMinimo} @ {a.almacenNombre}
                                </span>
                                {(a.sugerido ?? 0) > 0 && (
                                    <Badge variant="outline" className="ml-auto">
                                        reponer ≈ {a.sugerido}
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Stock actual (derivado de movimientos)</CardTitle>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                await descargarCsv(
                                    "movimiento-inventario/stock/exportar",
                                    "stock-inventario.csv",
                                    almacenId ? { almacenId } : undefined,
                                );
                            } catch (e: any) {
                                toast.error(e?.message || "Error al exportar el stock");
                            }
                        }}
                    >
                        <Download className="mr-1 h-4 w-4" /> Exportar CSV
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        title={'Stock'}
                        data={filas}
                        columns={columns as any}
                        headerBackground='#f3f0f2'
                        headerColor='#0f766e'
                    />
                </CardContent>
            </Card>
        </div>
    );
}
