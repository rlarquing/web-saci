"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { findAll } from "./services/movimiento.service";
import { FormMovimiento } from "./components/form-movimiento.component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { descargarCsv } from "@/utilities";

const DataTable = dynamic(
  () => import("@/components/DataTable/data-table.component").then(mod => mod.DataTable),
  { ssr: false, loading: () => <div>Cargando...</div> }
);

export default function MovimientosPage() {
    const [data, setData] = useState<any>({});
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

    useEffect(() => {
        (async (): Promise<void> => {
            setData(await findAll(paginationModel.pageSize, paginationModel.page + 1));
        })();
    }, [paginationModel]);

    return (
        <div className="space-y-6 p-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Kardex de movimientos</CardTitle>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                await descargarCsv("movimiento-inventario/exportar", "movimientos-inventario.csv");
                            } catch (e: any) {
                                toast.error(e?.message || "Error al exportar el kardex");
                            }
                        }}
                    >
                        <Download className="mr-1 h-4 w-4" /> Exportar CSV
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        title={'Kardex'}
                        data={data}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        headerBackground='#f3f0f2'
                        headerColor='#0f766e'
                    />
                </CardContent>
            </Card>
            <FormMovimiento />
        </div>
    );
}
