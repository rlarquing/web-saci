"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { niveles } from "../routers/nivel.router";
import { create, selectAlmacenes, buscarProductos } from "../services/nivel.service";

/**
 * Alta de nivel por producto+almacén (safety stock — backlog P2).
 * El producto se elige con búsqueda por texto (SKU o nombre).
 */
export default function NewNivel() {
    const router = useRouter();
    const [almacenes, setAlmacenes] = useState<any[]>([]);
    const [almacenId, setAlmacenId] = useState("");
    const [termino, setTermino] = useState("");
    const [resultados, setResultados] = useState<any[]>([]);
    const [productoSel, setProductoSel] = useState<any>(null);
    const [stockMinimo, setStockMinimo] = useState(0);
    const [stockSeguridad, setStockSeguridad] = useState(0);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        (async (): Promise<void> => {
            setAlmacenes(await selectAlmacenes());
        })();
    }, []);

    const buscar = async () => {
        if (termino.trim().length < 2) return;
        try {
            setResultados(await buscarProductos(termino.trim()));
        } catch {
            toast.error("Error al buscar productos");
        }
    };

    const onSubmit = async () => {
        if (!productoSel) {
            toast.error("Selecciona un producto");
            return;
        }
        if (!almacenId) {
            toast.error("Selecciona un almacén");
            return;
        }
        setGuardando(true);
        const resp = await create({
            productoId: productoSel.id,
            almacenId,
            stockMinimo: Number(stockMinimo) || 0,
            stockSeguridad: Number(stockSeguridad) || 0,
        });
        setGuardando(false);
        if (resp.type === "success") {
            toast.success(resp.message || "Nivel creado");
            router.push(niveles.index);
        } else {
            toast.error(resp.message || "Error al crear el nivel");
        }
    };

    return (
        <div className="mx-auto max-w-2xl p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Nuevo nivel de stock</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="almacenId">Almacén</Label>
                        <select
                            id="almacenId"
                            className="w-full rounded-md border p-2"
                            value={almacenId}
                            onChange={(e) => setAlmacenId(e.target.value)}
                        >
                            <option value="">Seleccione…</option>
                            {almacenes.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <Label>Producto</Label>
                        {productoSel ? (
                            <div className="flex items-center justify-between rounded-md border p-2">
                                <span className="text-sm">
                                    <b>{productoSel.codigo}</b> · {productoSel.nombre}
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => setProductoSel(null)} aria-label="Quitar producto">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="SKU o nombre (p.ej. PRD-000001 o cemento)"
                                        value={termino}
                                        onChange={(e) => setTermino(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); buscar(); } }}
                                    />
                                    <Button type="button" variant="outline" onClick={buscar}>
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                                {resultados.length > 0 && (
                                    <div className="max-h-48 overflow-y-auto rounded-md border">
                                        {resultados.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                                onClick={() => {
                                                    setProductoSel(p);
                                                    setResultados([]);
                                                    setTermino("");
                                                }}
                                            >
                                                <b>{p.codigo}</b> · {p.nombre}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
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
                        Punto de reorden para este almacén: <b>{(Number(stockMinimo) || 0) + (Number(stockSeguridad) || 0)}</b>
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
