"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { findAll } from "./services/conteo.service";
import { conteos } from "./routers/conteo.router";
import { descargarCsv } from "@/utilities";

const DataTable = dynamic(
  () => import("@/components/DataTable/data-table.component").then(mod => mod.DataTable),
  { ssr: false, loading: () => <div>Cargando...</div> }
);

const ESTADOS = ["", "ABIERTO", "CERRADO", "CANCELADO"];

export default function ConteosPage() {
    const [data, setData] = useState<any>({});
    const [estado, setEstado] = useState("");
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        (async (): Promise<void> => {
            setCargando(true);
            try {
                setData(await findAll(10, 1, estado || undefined));
            } catch {
                toast.error("No se pudieron cargar los conteos");
            } finally {
                setCargando(false);
            }
        })();
    }, [estado]);

    const exportar = async (): Promise<void> => {
        try {
            await descargarCsv("conteo-inventario", "conteos-inventario.csv");
        } catch (e: any) {
            toast.error(e?.message || "Error al exportar");
        }
    };

    const actions: any = {
        field: "action",
        headerName: "Acciones",
        flex: 1,
        renderCell: (row: any) => (
            <Link href={conteos.show.replace("[id]", row.id)}>
                <Button variant="ghost" size="icon" title="Abrir conteo">
                    <Eye className="h-4 w-4" />
                </Button>
            </Link>
        ),
    };

    return (
        <div className="space-y-6 p-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Conteos cíclicos de inventario</CardTitle>
                    <div className="flex items-center gap-2">
                        <select
                            className="rounded-md border p-2"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            aria-label="Filtrar por estado"
                        >
                            {ESTADOS.map((e) => (
                                <option key={e || "todos"} value={e}>
                                    {e === "" ? "Todos los estados" : e}
                                </option>
                            ))}
                        </select>
                        <Button variant="outline" onClick={exportar} disabled={cargando}>
                            Exportar CSV
                        </Button>
                        <Link href={conteos.new}>
                            <Button>
                                <Plus className="mr-1 h-4 w-4" /> Nuevo conteo
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        title="Conteos"
                        data={data}
                        actions={actions}
                        headerBackground="#f3f0f2"
                        headerColor="#0f766e"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
