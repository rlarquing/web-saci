"use client"

import { use, useEffect, useState } from "react";
import Link from "next/link";
import * as React from "react";
import { registroDiariosRoutes } from "../../routers/registro-diario.router";
import { findById, cerrarRegistro } from "../../services/registro-diario.service";
import { RegistroDiario } from "../../models/registro-diario.model";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ArrowLeft, Lock, CircleDot, CircleCheck,
    Car, DollarSign, Calendar, MapPin, Tag,
} from "lucide-react";

export default function Show({ params }: any) {
    const unwrappedParams: any = use(params);
    const id: string = unwrappedParams.id;
    const [registro, setRegistro] = useState<RegistroDiario | null>(null);
    const [loading, setLoading] = useState(true);
    const [cerrando, setCerrando] = useState(false);
    const [cerrarDialogOpen, setCerrarDialogOpen] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const result = await findById(id);
                setRegistro(result as RegistroDiario);
            } catch (error) {
                console.error('Error loading registro diario:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('cu-CU', {
            style: 'currency',
            currency: 'CUP',
            minimumFractionDigits: 2,
        }).format(value);
    };

    const handleCerrarClick = () => {
        setCerrarDialogOpen(true);
    };

    const handleConfirmarCierre = async () => {
        if (!registro) return;
        setCerrando(true);
        try {
            await cerrarRegistro(registro.id);
            // Recargar el registro
            const result = await findById(registro.id);
            setRegistro(result as RegistroDiario);
            setCerrarDialogOpen(false);
        } catch (error) {
            console.error('Error al cerrar el registro:', error);
        } finally {
            setCerrando(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200" style={{ borderTopColor: '#0f766e' }}></div>
            </div>
        );
    }

    if (!registro) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontró el registro diario</p>
            </div>
        );
    }

    const isAbierto = registro.estado === 'abierto';

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Botón volver */}
            <Link href={registroDiariosRoutes.index}>
                <Button variant="ghost" className="gap-2 hover:bg-red-50 hover:text-red-700">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Registros Diarios
                </Button>
            </Link>

            {/* Sección Hero */}
            <Card className="overflow-hidden border-0">
                <div className={`p-8 text-white ${isAbierto ? 'bg-gradient-to-r from-emerald-600 to-green-600' : 'bg-gradient-to-r from-slate-600 to-gray-600'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                {isAbierto ? (
                                    <CircleDot className="h-8 w-8 text-white" />
                                ) : (
                                    <CircleCheck className="h-8 w-8 text-white" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Registro Diario — {registro.fecha}
                                </h1>
                                <p className="text-white/80 mt-1">
                                    Almacen: {registro.almacenNombre}
                                </p>
                            </div>
                        </div>
                        {/* Botón Cerrar Día en el hero si está abierto */}
                        {isAbierto && (
                            <Button
                                onClick={handleCerrarClick}
                                variant="outline"
                                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:text-white gap-2"
                            >
                                <Lock className="h-4 w-4" />
                                Cerrar Día
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Resumen principal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Estado */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Estado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge
                            variant="secondary"
                            className={`gap-1 font-medium text-sm px-3 py-1 ${
                                isAbierto
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {isAbierto ? (
                                <>
                                    <CircleDot className="h-3.5 w-3.5" />
                                    Abierto
                                </>
                            ) : (
                                <>
                                    <CircleCheck className="h-3.5 w-3.5" />
                                    Cerrado
                                </>
                            )}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Total Unidades */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            Total Unidades
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{registro.totalEntradas}</p>
                        <p className="text-xs text-muted-foreground mt-1">vehículos atendidos</p>
                    </CardContent>
                </Card>

                {/* Total Salidas */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Salidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{formatCurrency(registro.totalSalidas)}</p>
                        <p className="text-xs text-muted-foreground mt-1">ingresos del día</p>
                    </CardContent>
                </Card>
            </div>

            {/* Información del registro */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Información del Registro
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Fecha</p>
                                <p className="font-medium">{registro.fecha}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Almacen</p>
                                <p className="font-medium">{registro.almacenNombre}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detalle por producto */}
            {registro.detalleCategorias && registro.detalleCategorias.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5 text-amber-600" />
                            Detalle por Tipo de Medio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {/* Encabezado */}
                            <div className="grid grid-cols-3 gap-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b">
                                <span>Tipo de Medio</span>
                                <span className="text-center">Cantidad</span>
                                <span className="text-right">Ingreso</span>
                            </div>
                            {registro.detalleCategorias.map((detalle, idx) => (
                                <div key={idx} className="grid grid-cols-3 gap-4 text-sm py-2 border-b border-dashed border-muted/50 last:border-0">
                                    <span className="font-medium">{detalle.producto}</span>
                                    <span className="text-center">{detalle.cantidad} uds</span>
                                    <span className="text-right font-semibold">{formatCurrency(detalle.ingreso)}</span>
                                </div>
                            ))}
                            {/* Totales */}
                            <div className="grid grid-cols-3 gap-4 text-sm font-bold pt-3 border-t-2">
                                <span>TOTAL</span>
                                <span className="text-center">{registro.totalEntradas} uds</span>
                                <span className="text-right">{formatCurrency(registro.totalSalidas)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Mensaje si ya está cerrado */}
            {registro.estado === 'cerrado' && (
                <Card className="border-slate-200 bg-slate-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-slate-600">
                            <CircleCheck className="h-5 w-5" />
                            <p className="text-sm">
                                Este registro diario ya fue cerrado. No se pueden registrar más movimientos para este día.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Diálogo de confirmación para cerrar registro */}
            <AlertDialog open={cerrarDialogOpen} onOpenChange={setCerrarDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-amber-600" />
                            Cerrar Registro Diario
                        </AlertDialogTitle>
                        <AlertDialogDescription
                            render={<div className="space-y-3" />}
                        >
                            <p>
                                ¿Está seguro de que desea cerrar el registro diario del <strong>{registro.fecha}</strong> del almacen <strong>{registro.almacenNombre}</strong>?
                            </p>
                            <div className="rounded-lg border bg-amber-50 p-3 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-amber-800">Total Unidades:</span>
                                    <span className="font-semibold">{registro.totalEntradas}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-amber-800">Total Salidas:</span>
                                    <span className="font-semibold">{formatCurrency(registro.totalSalidas)}</span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Esta acción no se puede deshacer. Una vez cerrado, no se podrán registrar más movimientos para este día.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={cerrando}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmarCierre}
                            disabled={cerrando}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {cerrando ? 'Cerrando...' : 'Sí, Cerrar Día'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
