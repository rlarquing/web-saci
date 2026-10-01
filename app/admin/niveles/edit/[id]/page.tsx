"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { niveles } from "../../routers/nivel.router";
import { findById, update } from "../../services/nivel.service";

/** Edición de umbrales de un nivel existente (producto y almacén fijos). */
export default function EditNivel() {
    const router = useRouter();
    const params: any = useParams();
    const id = params?.id;
    const [nivel, setNivel] = useState<any>(null);
    const [stockMinimo, setStockMinimo] = useState(0);
    const [stockSeguridad, setStockSeguridad] = useState(0);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        (async (): Promise<void> => {
            try {
                const n = await findById(id);
                setNivel(n);
                setStockMinimo(n?.stockMinimo ?? 0);
                setStockSeguridad(n?.stockSeguridad ?? 0);
            } catch {
                toast.error("No se pudo cargar el nivel");
            }
        })();
    }, [id]);

    const onSubmit = async () => {
        setGuardando(true);
        const resp = await update(id, {
            stockMinimo: Number(stockMinimo) || 0,
            stockSeguridad: Number(stockSeguridad) || 0,
        });
        setGuardando(false);
        if (resp.type === "success") {
            toast.success(resp.message || "Nivel actualizado");
            router.push(niveles.index);
        } else {
            toast.error(resp.message || "Error al actualizar");
        }
    };

    return (
        <div className="mx-auto max-w-2xl p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Editar nivel de stock</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-md border p-3 text-sm">
                        <b>{nivel?.productoCodigo}</b> · {nivel?.productoNombre}
                        <span className="text-muted-foreground"> @ {nivel?.almacenNombre}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label htmlFor="stockMinimo">Stock mínimo</Label>
                            <Input
                                id="stockMinimo"
                                type="number"
                                min={0}
                                value={stockMinimo}
                                onChange={(e) => setStockMinimo(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="stockSeguridad">Stock de seguridad</Label>
                            <Input
                                id="stockSeguridad"
                                type="number"
                                min={0}
                                value={stockSeguridad}
                                onChange={(e) => setStockSeguridad(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Punto de reorden: <b>{(Number(stockMinimo) || 0) + (Number(stockSeguridad) || 0)}</b>
                    </p>
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => router.push(niveles.index)}>Cancelar</Button>
                        <Button type="button" onClick={onSubmit} disabled={guardando}>Guardar</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
