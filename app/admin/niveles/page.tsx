"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Trash2 } from "lucide-react";
import { createColumns } from "@/components/DataTable/data-table.component";
import { ConfirmDialog } from "@/components/confirm-dialog.component";
import { toast } from "sonner";
import { niveles } from "./routers/nivel.router";
import { findAll, eliminar, selectAlmacenes } from "./services/nivel.service";

const DataTable = dynamic(
  () => import("@/components/DataTable/data-table.component").then(mod => mod.DataTable),
  { ssr: false, loading: () => <div>Cargando...</div> }
);

/**
 * Niveles de stock por producto/almacén (safety stock — backlog P2).
 * Punto de reorden = stock mínimo + stock de seguridad, por ubicación.
 */
export default function NivelesPage() {
    const [data, setData] = useState<any>({});
    const [almacenes, setAlmacenes] = useState<any[]>([]);
    const [almacenId, setAlmacenId] = useState('');
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [aBorrar, setABorrar] = useState<any>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        (async (): Promise<void> => {
            setAlmacenes(await selectAlmacenes());
        })();
    }, []);

    useEffect(() => {
        (async (): Promise<void> => {
            setData(await findAll(paginationModel.pageSize, paginationModel.page + 1, almacenId || undefined));
        })();
    }, [paginationModel, almacenId]);

    const borrar = async (): Promise<void> => {
        if (!aBorrar) return;
        const resp = await eliminar(aBorrar.id);
        if (resp.type === "success") toast.success(resp.message || "Nivel eliminado");
        else toast.error(resp.message || "Error al eliminar el nivel");
        setConfirmOpen(false);
        setABorrar(null);
        setData(await findAll(paginationModel.pageSize, paginationModel.page + 1, almacenId || undefined));
    };

    const columns = [
        ...createColumns(
            ['productoCodigo', 'productoNombre', 'almacenNombre', 'stockMinimo', 'stockSeguridad', 'puntoReorden'],
            ['SKU', 'Producto', 'Almacén', 'Stock mínimo', 'Seguridad', 'Punto reorden'],
        ),
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }: { row: any }) => {
                const n = row.original;
                return (
                    <div className="flex items-center gap-1">
                        <Link href={`${niveles.edit.replace('[id]', n.id)}`}>
                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setABorrar(n); setConfirmOpen(true); }}
                        >
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-6 p-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Niveles de stock por almacén</CardTitle>
                    <div className="flex items-center gap-2">
                        <select className="rounded-md border p-2" value={almacenId} onChange={(e) => setAlmacenId(e.target.value)}>
                            <option value="">Todos los almacenes</option>
                            {almacenes.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                        <Link href={niveles.new}>
                            <Button variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="mb-3 text-xs text-muted-foreground">
                        Sin nivel específico rige el mínimo global del producto. El punto de reorden dispara las alertas (campana, push y digest).
                    </p>
                    <DataTable
                        title={'Niveles'}
                        data={data}
                        columns={columns as any}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        headerBackground='#f3f0f2'
                        headerColor='#0f766e'
                    />
                </CardContent>
            </Card>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="¿Eliminar este nivel?"
                description={aBorrar ? `Se dejará de aplicar el umbral de ${aBorrar.productoCodigo} en ${aBorrar.almacenNombre} (volverá a regir el global del producto).` : undefined}
                onConfirm={borrar}
                destructive
            />
        </div>
    );
}
