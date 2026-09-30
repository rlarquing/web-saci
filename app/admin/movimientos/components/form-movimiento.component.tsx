"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { entrada, salida, ajuste } from "../services/movimiento.service";
import { selectNomenclador } from "@/app/admin/productos/services/producto.service";

/**
 * Registro de movimiento por escaneo (o código tipeado / escáner USB).
 * Fase 1 del plan: ENTRADA y SALIDA por QR + AJUSTE manual solo para jefe/admin.
 */
export function FormMovimiento() {
    const [modo, setModo] = useState<'ENTRADA' | 'SALIDA' | 'AJUSTE'>('ENTRADA');
    const [qrCodigo, setQrCodigo] = useState('');
    const [cantidad, setCantidad] = useState('1');
    const [signo, setSigno] = useState('1');
    const [observaciones, setObservaciones] = useState('');
    const [almacenes, setAlmacenes] = useState<any[]>([]);
    const [almacenId, setAlmacenId] = useState('');
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        (async (): Promise<void> => {
            setAlmacenes(await selectNomenclador('almacen'));
        })();
    }, []);

    const enviar = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcesando(true);
        try {
            const cuerpo: any = { cantidad: Number(cantidad) };
            if (qrCodigo) cuerpo.qrCodigo = qrCodigo.trim();
            if (almacenId) cuerpo.almacenId = almacenId;
            let respuesta: any;
            if (modo === 'AJUSTE') {
                if (!observaciones.trim()) {
                    toast.error('El ajuste requiere observaciones (motivo)');
                    return;
                }
                respuesta = await ajuste({ ...cuerpo, signo: Number(signo), observaciones });
            } else {
                respuesta = modo === 'ENTRADA'
                    ? await entrada(cuerpo)
                    : await salida(cuerpo);
            }
            if (respuesta?.type === 'success') {
                toast.success(respuesta.message || `${modo} registrada`);
                setQrCodigo('');
                setCantidad('1');
                setObservaciones('');
            } else {
                toast.error(respuesta?.message || 'Error al registrar el movimiento');
            }
        } finally {
            setProcesando(false);
        }
    };

    return (
        <Card className="mx-auto max-w-xl">
            <CardHeader>
                <CardTitle>Registrar movimiento</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex gap-2">
                    {(['ENTRADA', 'SALIDA', 'AJUSTE'] as const).map((m) => (
                        <Button key={m} type="button" variant={modo === m ? 'default' : 'outline'} onClick={() => setModo(m)}>
                            {m}
                        </Button>
                    ))}
                </div>
                <form onSubmit={enviar} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="qr">Código QR (escáner o tipeado)</Label>
                        <Input id="qr" value={qrCodigo} onChange={(e) => setQrCodigo(e.target.value)} placeholder="QRI-000001" autoFocus />
                    </div>
                    {modo === 'AJUSTE' && (
                        <div className="space-y-1">
                            <Label htmlFor="almacen">Almacén (ajuste manual)</Label>
                            <select id="almacen" className="w-full rounded-md border p-2" value={almacenId} onChange={(e) => setAlmacenId(e.target.value)}>
                                <option value="">Seleccione…</option>
                                {almacenes.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="cantidad">Cantidad</Label>
                            <Input id="cantidad" type="number" min={0.01} step="0.01" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                        </div>
                        {modo === 'AJUSTE' && (
                            <div className="space-y-1">
                                <Label htmlFor="signo">Tipo</Label>
                                <select id="signo" className="w-full rounded-md border p-2" value={signo} onChange={(e) => setSigno(e.target.value)}>
                                    <option value="1">Sobrante (+)</option>
                                    <option value="-1">Faltante (−)</option>
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="obs">Observaciones {modo === 'AJUSTE' && '(obligatorio)'}</Label>
                        <Input id="obs" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={procesando}>
                        {procesando ? 'Registrando…' : `Registrar ${modo}`}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
