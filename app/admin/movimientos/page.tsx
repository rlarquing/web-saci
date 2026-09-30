"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { findAll } from "./services/movimiento.service";
import { FormMovimiento } from "./components/form-movimiento.component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
                <CardHeader><CardTitle>Kardex de movimientos</CardTitle></CardHeader>
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
