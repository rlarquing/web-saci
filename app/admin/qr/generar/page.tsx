'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, QrCode, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { generateQrs, countDisponibles } from '../services';
import { getUserAlmacenes, getUserProductos } from '@/utilities/get-user-logged.utility';
import { SelectOption } from '@/models';

export default function GenerarQrPage() {
    const router = useRouter();
    const [tiposMedio, setTiposMedio] = useState<SelectOption[]>([]);
    const [productoSelected, setProductoSelected] = useState<string>('');
    const [cantidad, setCantidad] = useState<number>(10);
    const [loading, setLoading] = useState(false);
    const [loadingTipos, setLoadingTipos] = useState(true);
    const [disponibles, setDisponibles] = useState<number | null>(null);
    const [almacenes, setAlmacenes] = useState<SelectOption[]>([]);
    const [selectedAlmacenId, setSelectedAlmacenId] = useState<string>('');

    async function loadInitialData() {
        try {
            await loadAlmacenes();
            await loadTiposMedio();
        } catch (error) {
            console.error('Error loading initial data:', error);
            toast.error('Error al cargar los datos iniciales');
        }
    }

    async function loadAlmacenes() {
        const result = getUserAlmacenes();
        if (result.length > 0) {
            setAlmacenes(result);
            if (result.length === 1) {
                setSelectedAlmacenId(result[0].value);
            }
        } else {
            toast.error('No tiene almacenes asignados');
        }
    }

    async function loadTiposMedio() {
        try {
            setLoadingTipos(true);
            // Primero leer de cookie
            const cached = getUserProductos();
            if (cached.length > 0) {
                setTiposMedio(cached);
                return;
            }
            // Fallback: llamar al API
            const result = await import('@/app/admin/nomenclators/services/nomenclator.service').then(m => m.createSelect('producto'));
            if (Array.isArray(result)) {
                setTiposMedio(result);
            }
        } catch (error) {
            console.error('Error al cargar tipos de medio:', error);
            toast.error('Error al cargar los tipos de medio');
        } finally {
            setLoadingTipos(false);
        }
    }

    async function loadDisponibles(productoId: string) {
        try {
            const count = await countDisponibles(productoId);
            setDisponibles(count);
        } catch (error) {
            setDisponibles(null);
        }
    }

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (productoSelected && selectedAlmacenId) {
            loadDisponibles(productoSelected);
        }
    }, [productoSelected, selectedAlmacenId]);

    const handleGenerar = async () => {
        if (!productoSelected) {
            toast.error('Seleccione un producto');
            return;
        }

        if (!selectedAlmacenId) {
            toast.error('Seleccione un almacen');
            return;
        }

        if (cantidad < 1 || cantidad > 1000) {
            toast.error('La cantidad debe estar entre 1 y 1000');
            return;
        }

        try {
            setLoading(true);
            const result = await generateQrs(productoSelected, cantidad, selectedAlmacenId);
            
            if (result) {
                toast.success(result.mensaje || `Se generaron ${result.cantidadGenerada} QRs exitosamente`);
                router.push(`/admin/qr/lote/${result.loteId}`);
            } else {
                toast.error('Error al generar los QRs');
            }
        } catch (error) {
            console.error('Error al generar QRs:', error);
            toast.error('Error al generar los QRs');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/qr">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold">Generar QRs</h2>
                    <p className="text-gray-600">
                        Seleccione el almacen y producto para generar QRs
                    </p>
                </div>
            </div>

            {/* Formulario */}
            <Card className="max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        Nuevo Lote de QRs
                    </CardTitle>
                    <CardDescription>
                        Genere un nuevo lote de códigos QR para un producto específico.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Selector de Almacen */}
                    <div className="space-y-2">
                        <Label htmlFor="almacen">
                            Almacen *
                        </Label>
                        <Select
                            value={selectedAlmacenId}
                            onValueChange={(value) => setSelectedAlmacenId(value ?? "")}
                            disabled={almacenes.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={
                                    almacenes.length === 0 
                                        ? 'No hay almacenes disponibles' 
                                        : 'Seleccione un almacen'
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {almacenes.map((almacen) => (
                                    <SelectItem key={almacen.value} value={almacen.value}>
                                        {almacen.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {almacenes.length > 1 && (
                            <p className="text-xs text-gray-500">
                                Tiene {almacenes.length} almacenes asignados
                            </p>
                        )}
                    </div>

                    {/* Tipo de Medio */}
                    <div className="space-y-2">
                        <Label htmlFor="producto">Tipo de Medio *</Label>
                        <Select
                            value={productoSelected}
                            onValueChange={(value) => setProductoSelected(value ?? "")}
                            disabled={loadingTipos || !selectedAlmacenId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={
                                    loadingTipos 
                                        ? 'Cargando tipos de medio...'
                                        : tiposMedio.length === 0
                                            ? 'No hay tipos de medio'
                                            : 'Seleccione un producto'
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {tiposMedio.map((tipo) => (
                                    <SelectItem key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* QRs Disponibles */}
                    {disponibles !== null && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>{disponibles}</strong> QRs disponibles para este tipo
                            </p>
                        </div>
                    )}

                    {/* Cantidad */}
                    <div className="space-y-2">
                        <Label htmlFor="cantidad">Cantidad de QRs a generar *</Label>
                        <Input
                            id="cantidad"
                            type="number"
                            min={1}
                            max={1000}
                            value={cantidad}
                            onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                        />
                        <p className="text-xs text-gray-500">
                            Mínimo 1, máximo 1000 QRs por lote
                        </p>
                    </div>

                    {/* Botón */}
                    <Button
                        className="w-full"
                        onClick={handleGenerar}
                        disabled={loading || loadingTipos || !selectedAlmacenId}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generando...
                            </>
                        ) : (
                            <>
                                <QrCode className="mr-2 h-4 w-4" />
                                Generar {cantidad} QRs
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
