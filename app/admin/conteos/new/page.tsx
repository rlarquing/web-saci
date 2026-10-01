"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { crear } from "../services/conteo.service";
import { conteos } from "../routers/conteo.router";
import { selectAlmacenes } from "../../stock/services/stock.service";

export default function NuevoConteo() {
    const router = useRouter();
    const [almacenes, setAlmacenes] = useState<any[]>([]);
    const [almacenId, setAlmacenId] = useState("");
    const [esCiego, setEsCiego] = useState(false);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        (async (): Promise<void> => {
            setAlmacenes(await selectAlmacenes());
        })();
    }, []);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!almacenId) {
            toast.error("Selecciona un almacén");
            return;
        }
        setGuardando(true);
        try {
            const { resp, id } = await crear({ almacenId, esCiego });
            if (resp.type === "success") {
                toast.success(resp.message || "Conteo abierto");
                if (id) router.push(conteos.show.replace("[id]", id));
                else router.push(conteos.index);
            } else {
                toast.error(resp.message || "No se pudo abrir el conteo");
            }
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="mx-auto max-w-xl p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Abrir conteo cíclico</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="almacenId">Almacén</Label>
                            <select
                                id="almacenId"
                                className="w-full rounded-md border p-2"
                                value={almacenId}
                                onChange={(e) => setAlmacenId(e.target.value)}
                            >
                                <option value="">Selecciona un almacén…</option>
                                {almacenes.map((a) => (
                                    <option key={a.value} value={a.value}>
                                        {a.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id="esCiego"
                                type="checkbox"
                                className="h-4 w-4"
                                checked={esCiego}
                                onChange={(e) => setEsCiego(e.target.checked)}
                            />
                            <Label htmlFor="esCiego" className="font-normal">
                                Conteo a ciegas (ocultar el stock esperado hasta cerrar)
                            </Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Al abrir se congela el stock esperado de todos los productos activos.
                            Solo puede haber un conteo abierto por almacén y el cierre exige
                            haber contado todas las líneas: cada diferencia generará un ajuste auditable.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => router.push(conteos.index)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={guardando || !almacenId}>
                                {guardando ? "Abriendo…" : "Abrir conteo"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
