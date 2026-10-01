"use client";
import { useEffect, useState } from "react";
import { Bell, TriangleAlert, PackageMinus, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { socketService } from "@/services/socket.service";
import { get } from "@/utilities";

interface Notificacion {
    id: string;
    tipo: "BAJO_MINIMO" | "REORDEN";
    productoCodigo: string;
    productoNombre: string;
    almacenNombre: string;
    stock: number;
    puntoReorden: number;
    sugerido: number;
    timestamp: string;
}

/**
 * Campana de notificaciones del panel (backlog P2).
 * Muestra las alertas activas (bajo punto de reorden) al abrir y recibe
 * push en vivo por el evento socket 'notificacion' cuando un movimiento
 * cruza el umbral. El contador se limpia al abrir la campana.
 */
export function CampanaNotificaciones() {
    const [abierta, setAbierta] = useState(false);
    const [noLeidas, setNoLeidas] = useState(0);
    const [items, setItems] = useState<Notificacion[]>([]);

    // Alertas activas al montar (equivalente al "bandeja" del API)
    useEffect(() => {
        (async (): Promise<void> => {
            try {
                const resp = await get("movimiento-inventario/bajo-minimo", true);
                const filas: any[] = Array.isArray(resp?.obj) ? resp.obj : [];
                setItems(
                    filas.map((a: any, i: number) => ({
                        id: `${a.productoId}-${a.almacenId}-${i}`,
                        tipo: a.estado ?? "REORDEN",
                        productoCodigo: a.productoCodigo,
                        productoNombre: a.productoNombre,
                        almacenNombre: a.almacenNombre,
                        stock: a.stock,
                        puntoReorden: a.puntoReorden ?? a.stockMinimo,
                        sugerido: a.sugerido ?? 0,
                        timestamp: new Date().toISOString(),
                    })),
                );
            } catch {
                // sin alertas o error de red: la campana queda vacía
            }
        })();
    }, []);

    // Push en vivo por socket
    useEffect(() => {
        const unsubscribe = socketService.onNotificacion((data) => {
            setItems((prev) => [
                {
                    id: `${data.productoId}-${data.almacenId}-${data.timestamp}`,
                    tipo: data.tipo,
                    productoCodigo: data.productoCodigo,
                    productoNombre: data.productoNombre,
                    almacenNombre: data.almacenNombre,
                    stock: data.stock,
                    puntoReorden: data.puntoReorden,
                    sugerido: data.sugerido,
                    timestamp: data.timestamp,
                },
                ...prev.filter(
                    (p) =>
                        !(
                            p.productoCodigo === data.productoCodigo &&
                            p.almacenNombre === data.almacenNombre
                        ),
                ),
            ].slice(0, 30));
            setNoLeidas((n) => n + 1);
        });
        return () => unsubscribe();
    }, []);

    const handleOpenChange = (open: boolean) => {
        setAbierta(open);
        if (open) setNoLeidas(0);
    };

    return (
        <Popover open={abierta} onOpenChange={handleOpenChange}>
            <PopoverTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-white hover:bg-white/10 hover:text-white"
                        aria-label={`Notificaciones${noLeidas ? ` (${noLeidas} nuevas)` : ""}`}
                    />
                }
            >
                <Bell className="h-5 w-5" />
                {noLeidas > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {noLeidas > 9 ? "9+" : noLeidas}
                    </span>
                )}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-3 py-2">
                    <span className="text-sm font-semibold">Alertas de stock</span>
                    <Badge variant="outline" className="text-[10px]">
                        punto de reorden
                    </Badge>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
                            <CheckCheck className="h-6 w-6" />
                            Sin alertas: todo por encima del punto de reorden
                        </div>
                    ) : (
                        items.map((n) => (
                            <div
                                key={n.id}
                                className="flex items-start gap-2 border-b px-3 py-2 last:border-b-0"
                            >
                                {n.tipo === "BAJO_MINIMO" ? (
                                    <PackageMinus className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                                ) : (
                                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {n.productoCodigo} · {n.productoNombre}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {n.stock} / {n.puntoReorden} en {n.almacenNombre}
                                        {n.sugerido > 0 && ` · reponer ≈ ${n.sugerido}`}
                                    </p>
                                </div>
                                <Badge
                                    variant={n.tipo === "BAJO_MINIMO" ? "destructive" : "secondary"}
                                    className="shrink-0 text-[10px]"
                                >
                                    {n.tipo === "BAJO_MINIMO" ? "BAJO MÍN" : "REORDEN"}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default CampanaNotificaciones;
