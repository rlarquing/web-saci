'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchInput } from '@/components/search-input.component';
import { Plus, FileText, Trash2, Loader2 } from 'lucide-react';
import { getLotes } from './services';
import { formatFechaHumanaConHora } from '@/utilities/format-date.utility';
import { deleteLote } from './services/qr.service';
import { getQrLoteRoute } from './routers/qr.router';
import { getObjCookie } from '@/utilities/auth-cookies.utility';
import { ConfirmDialog } from '@/components/confirm-dialog.component';
import { toast } from 'sonner';

const DataTable = dynamic(
  () => import('@/components/DataTable/data-table.component').then(mod => mod.DataTable),
  { ssr: false, loading: () => <div>Cargando...</div> }
);

interface LoteData {
    id?: string;
    loteId: string;
    productoId?: string;
    productoNombre: string;
    productoCodigo: string;
    cantidad: number;
    primerNumero: number;
    ultimoNumero: number;
    fechaGeneracion: string;
    almacenNombre?: string;
}

export default function QrLotesPage() {
    const [lotesData, setLotesData] = useState<LoteData[]>([]);
    const [loading, setLoading] = useState(true);
    const [buscar, setBuscar] = useState('');
    const [almacenNombre, setAlmacenNombre] = useState<string>('');
    const [selectionModel, setSelectionModel] = useState<any[]>([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmLoteId, setConfirmLoteId] = useState<string>('');
    const [confirmLoteCantidad, setConfirmLoteCantidad] = useState<number>(0);
    const [deletingLote, setDeletingLote] = useState<string | null>(null);

    async function loadLotes() {
        try {
            setLoading(true);
            const data = await getLotes();
            setLotesData(data);
        } catch (error) {
            console.error('Error al cargar lotes:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadLotes();
        try {
            const userLoggedStr = getObjCookie('userLogged');
            if (userLoggedStr && typeof userLoggedStr === 'string') {
                const user = JSON.parse(userLoggedStr);
                setAlmacenNombre(user.almacenNombre || '');
            }
        } catch (error) {
            console.error('Error al obtener almacen:', error);
        }
    }, []);

    const handleSearch = (value: string) => {
        setBuscar(value);
    };

    const formatDate = (date: Date | string) => {
        if (!date) return '';
        return formatFechaHumanaConHora(date);
    };

    const handleDeleteLote = (loteId: string, cantidad: number) => {
        setConfirmLoteId(loteId);
        setConfirmLoteCantidad(cantidad);
        setConfirmOpen(true);
    };

    const confirmDeleteLote = async () => {
        try {
            setDeletingLote(confirmLoteId);
            await deleteLote(confirmLoteId);
            toast.success('Lote eliminado correctamente');
            // Remove from local list
            setLotesData(prev => prev.filter(l => l.loteId !== confirmLoteId));
        } catch (error) {
            toast.error('Error al eliminar el lote');
        } finally {
            setDeletingLote(null);
            setConfirmOpen(false);
        }
    };

    const filteredLotes = lotesData.filter(lote =>
        lote.productoNombre.toLowerCase().includes(buscar.toLowerCase()) ||
        lote.productoCodigo.toLowerCase().includes(buscar.toLowerCase()) ||
        lote.loteId.toLowerCase().includes(buscar.toLowerCase()) ||
        (lote.almacenNombre && lote.almacenNombre.toLowerCase().includes(buscar.toLowerCase()))
    );

    const totalQrsGenerados = lotesData.reduce((sum, l) => sum + (l.cantidad || 0), 0);
    const totalLotes = lotesData.length;
    const ultimoLoteFecha = lotesData.length > 0 ? formatDate(lotesData[0].fechaGeneracion) : 'N/A';

    const tableData = {
        data: {
            items: filteredLotes.map(lote => ({
                id: lote.loteId,
                productoNombre: lote.productoNombre,
                almacenNombre: lote.almacenNombre || '-',
                cantidad: lote.cantidad,
                primerNumero: lote.primerNumero,
                ultimoNumero: lote.ultimoNumero,
                fechaGeneracion: formatDate(lote.fechaGeneracion),
            })),
            meta: {
                totalItems: filteredLotes.length,
                itemCount: filteredLotes.length,
                itemsPerPage: 10,
                totalPages: 1,
                currentPage: 1
            }
        },
        header: ['Lote ID', 'Tipo de Medio', 'Almacen', 'Cant.', 'Desde', 'Hasta', 'Fecha'],
        key: ['id', 'productoNombre', 'almacenNombre', 'cantidad', 'primerNumero', 'ultimoNumero', 'fechaGeneracion'],
    };

    const actions = {
        field: 'action',
        headerName: 'Acciones',
        flex: 1,
        renderCell: (params: any) => {
            const loteId = params.id || params.loteId;
            const cantidad = params.cantidad;
            const isDeleting = deletingLote === loteId;
            return (
                <div className="flex items-center gap-1">
                    <Link href={getQrLoteRoute(loteId)}>
                        <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Ver QRs
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteLote(loteId, cantidad)}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Eliminar
                    </Button>
                </div>
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header con información del almacen */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Gestión de QR</h2>
                    {almacenNombre && (
                        <p className="text-gray-600">Almacen: {almacenNombre}</p>
                    )}
                </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Lotes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalLotes}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total QRs Generados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalQrsGenerados}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Último Lote
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{ultimoLoteFecha}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabla de lotes */}
            <div className="bg-white rounded-lg shadow">
                {loading ? (
                    <div className="p-8 text-center">Cargando...</div>
                ) : (
                    <DataTable
                        title="Lotes de QR Generados"
                        data={tableData}
                        actions={actions}
                        toolBar={<div className="flex items-center gap-2">
                            <Link href="/admin/qr/generar">
                                <Button variant="outline" size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </Link>
                            <SearchInput
                                id="buscar"
                                placeholder="Buscar lotes..."
                                buscar={handleSearch}
                            />
                        </div>}
                        headerBackground="#f3f0f2"
                        headerColor="#0f766e"
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        onSelectionModelChange={setSelectionModel}
                        selectionModel={selectionModel}
                        noHorizontalScroll
                    />
                )}
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Eliminar Lote"
                description={`¿Está seguro de eliminar el lote ${confirmLoteId}? Se eliminarán permanentemente ${confirmLoteCantidad} QR${confirmLoteCantidad !== 1 ? 's' : ''} asociado${confirmLoteCantidad !== 1 ? 's' : ''}. Esta acción no se puede revertir.`}
                onConfirm={confirmDeleteLote}
                destructive
                confirmText="Eliminar"
            />
        </div>
    );
}
