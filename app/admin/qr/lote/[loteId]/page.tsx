'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
    ArrowLeft, Download, Loader2, QrCode, Trash2,
    MoreVertical, Ban, X as XIcon,
} from 'lucide-react';
import { getQrsByLote, getPdfUrl, deleteQr, deleteMultipleQrs, deleteLote, anularQr, anularMultipleQrs } from '../../services';
import { ReadQr } from '../../models';
import { getUserLogged, getToken } from '@/utilities/get-user-logged.utility';
import { socketService } from '@/services/socket.service';
import { ConfirmDialog } from '@/components/confirm-dialog.component';
import { formatFechaHumanaConHora } from '@/utilities/format-date.utility';

export default function LoteQrPage() {
    const params = useParams();
    const loteId = params.loteId as string;
    const router = useRouter();

    const [qrs, setQrs] = useState<ReadQr[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [token, setToken] = useState<string>('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmDescription, setConfirmDescription] = useState('');
    const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
    const [confirmDestructive, setConfirmDestructive] = useState(false);

    useEffect(() => {
        if (loteId) {
            loadQrs();
        }
        const user = getUserLogged();
        if (user?.token) {
            setToken(user.token);
        }
    }, [loteId]);

    // Suscripción en tiempo real: si otro escáner libera un QR de este lote
    // (salida), el estado cambia a 'disponible' sin recargar la página.
    useEffect(() => {
        if (!socketService.isConnected()) {
            const socketToken = getToken();
            if (socketToken) {
                socketService.connect(socketToken);
            }
        }

        const unsubscribe = socketService.onQrEstado((data) => {
            setQrs(prev => {
                if (data.estado !== 'disponible' && data.estado !== 'usado') return prev;
                let changed = false;
                const next = prev.map(qr => {
                    if (qr.codigo === data.qrCodigo && qr.estado !== data.estado) {
                        changed = true;
                        return {
                            ...qr,
                            estado: data.estado,
                            fechaUso: data.estado === 'usado' ? new Date() : undefined,
                        };
                    }
                    return qr;
                });
                return changed ? next : prev;
            });
        });

        return unsubscribe;
    }, []);

    async function loadQrs() {
        try {
            setLoading(true);
            const data = await getQrsByLote(loteId);
            setQrs(data);
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Error al cargar QRs:', error);
            toast.error('Error al cargar los QRs del lote');
        } finally {
            setLoading(false);
        }
    }

    const handleDownloadPdf = async () => {
        try {
            setDownloadingPdf(true);
            const apiUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '').replace(/\/$/, '');
            const tokenToUse = token || getToken();
            const pdfUrl = `${apiUrl}/qr/pdf/${loteId}`;

            const response = await fetch(pdfUrl, {
                headers: { 'Authorization': `Bearer ${tokenToUse}` }
            });

            if (!response.ok) throw new Error(`Error ${response.status}`);

            const blob = await response.blob();
            if (blob.size === 0) throw new Error('El PDF está vacío');

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qrs-${loteId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('PDF descargado exitosamente');
        } catch (error) {
            toast.error('Error al descargar el PDF');
        } finally {
            setDownloadingPdf(false);
        }
    };

    // Selection
    const toggleSelect = (qrId: string, estado: string) => {
        if (estado === 'anulado') return;
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(qrId)) next.delete(qrId);
            else next.add(qrId);
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    // Confirm helpers
    const openConfirm = (title: string, description: string, action: () => Promise<void>, destructive: boolean = true) => {
        setConfirmTitle(title);
        setConfirmDescription(description);
        setConfirmAction(() => action);
        setConfirmDestructive(destructive);
        setConfirmOpen(true);
    };

    // Individual actions
    const handleAnularQr = (qr: ReadQr) => {
        openConfirm(
            'Anular QR',
            `¿Está seguro de anular el QR ${qr.codigo}? Esta acción no se puede revertir.`,
            async () => {
                try {
                    setActionLoading(qr.id);
                    await anularQr(qr.id);
                    toast.success(`QR ${qr.codigo} anulado correctamente`);
                    await loadQrs();
                } catch (error) {
                    toast.error('Error al anular el QR');
                } finally {
                    setActionLoading(null);
                }
            },
            false
        );
    };

    const handleDeleteQr = (qr: ReadQr) => {
        openConfirm(
            'Eliminar QR',
            `¿Está seguro de eliminar permanentemente el QR ${qr.codigo}? Esta acción no se puede revertir.`,
            async () => {
                try {
                    setActionLoading(qr.id);
                    await deleteQr(qr.id);
                    toast.success(`QR ${qr.codigo} eliminado correctamente`);
                    await loadQrs();
                } catch (error) {
                    toast.error('Error al eliminar el QR');
                } finally {
                    setActionLoading(null);
                }
            },
            true
        );
    };

    // Batch actions
    const handleAnularSelected = () => {
        const count = selectedIds.size;
        openConfirm(
            'Anular QRs seleccionados',
            `¿Está seguro de anular ${count} QR${count > 1 ? 's' : ''} seleccionado${count > 1 ? 's' : ''}? Esta acción no se puede revertir.`,
            async () => {
                try {
                    setActionLoading('batch-anular');
                    await anularMultipleQrs(Array.from(selectedIds));
                    toast.success(`${count} QR${count > 1 ? 's' : ''} anulado${count > 1 ? 's' : ''} correctamente`);
                    await loadQrs();
                } catch (error) {
                    toast.error('Error al anular los QRs seleccionados');
                } finally {
                    setActionLoading(null);
                }
            },
            false
        );
    };

    const handleDeleteSelected = () => {
        const count = selectedIds.size;
        openConfirm(
            'Eliminar QRs seleccionados',
            `¿Está seguro de eliminar permanentemente ${count} QR${count > 1 ? 's' : ''} seleccionado${count > 1 ? 's' : ''}? Esta acción no se puede revertir.`,
            async () => {
                try {
                    setActionLoading('batch-delete');
                    await deleteMultipleQrs(Array.from(selectedIds));
                    toast.success(`${count} QR${count > 1 ? 's' : ''} eliminado${count > 1 ? 's' : ''} correctamente`);
                    await loadQrs();
                } catch (error) {
                    toast.error('Error al eliminar los QRs seleccionados');
                } finally {
                    setActionLoading(null);
                }
            },
            true
        );
    };

    const handleDeleteLote = () => {
        openConfirm(
            'Eliminar Lote Completo',
            `¿Está seguro de eliminar todo el lote ${loteId} y todos sus QRs? Esta acción eliminará permanentemente todos los QRs del lote y no se puede revertir.`,
            async () => {
                try {
                    setActionLoading('delete-lote');
                    await deleteLote(loteId);
                    toast.success('Lote eliminado correctamente');
                    router.push('/admin/qr');
                } catch (error) {
                    toast.error('Error al eliminar el lote');
                    setActionLoading(null);
                }
            },
            true
        );
    };

    const formatDate = (date: Date | string) => {
        if (!date) return '';
        return formatFechaHumanaConHora(date);
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'disponible': return 'bg-green-100 text-green-800';
            case 'usado': return 'bg-blue-100 text-blue-800';
            case 'anulado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const disponibles = qrs.filter(q => q.estado === 'disponible').length;
    const usados = qrs.filter(q => q.estado === 'usado').length;
    const anulados = qrs.filter(q => q.estado === 'anulado').length;
    const isActionable = (estado: string) => estado === 'disponible' || estado === 'usado';

    return (
        <div className="space-y-6 pb-28">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/qr">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold">Lote: {loteId}</h2>
                        {qrs.length > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-500">Producto:</span>
                                <Badge variant="secondary" className="text-xs">
                                    {qrs[0].productoNombre}
                                </Badge>
                                {qrs[0].almacenNombre && (
                                    <>
                                        <span className="text-sm text-gray-500">Almacen:</span>
                                        <Badge variant="secondary" className="text-xs">
                                            {qrs[0].almacenNombre}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleDownloadPdf}
                        disabled={downloadingPdf || loading}
                        variant="outline"
                    >
                        {downloadingPdf ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Descargando...</>
                        ) : (
                            <><Download className="mr-2 h-4 w-4" />Descargar PDF</>
                        )}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteLote}
                        disabled={actionLoading === 'delete-lote' || loading}
                    >
                        {actionLoading === 'delete-lote' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Eliminar Lote
                    </Button>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total QRs</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-2xl font-bold">{qrs.length}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Disponibles</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-2xl font-bold text-green-600">{disponibles}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Usados</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-2xl font-bold text-blue-600">{usados}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Anulados</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-2xl font-bold text-red-600">{anulados}</p></CardContent>
                </Card>
            </div>

            {/* Grid de QRs */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {qrs.map((qr) => {
                        const isSelected = selectedIds.has(qr.id);
                        const actionable = isActionable(qr.estado);
                        const isLoading = actionLoading === qr.id;

                        return (
                            <Card
                                key={qr.id}
                                className={`relative shadow-md hover:shadow-lg transition-all cursor-pointer ${
                                    isSelected ? 'ring-2 ring-amber-400 shadow-amber-100' : ''
                                } ${qr.estado === 'anulado' ? 'opacity-60' : ''}`}
                                onClick={() => actionable && toggleSelect(qr.id, qr.estado)}
                            >
                                <CardContent className="p-4 flex flex-col items-center">
                                    {/* Dropdown menu - top right */}
                                    {actionable && (
                                        <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={<Button variant="ghost" size="icon" className="h-7 w-7" />}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleAnularQr(qr)} className="text-amber-700">
                                                        <Ban className="h-4 w-4 mr-2" />
                                                        Anular QR
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteQr(qr)} className="text-red-700">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Eliminar QR
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}

                                    {/* Loading overlay */}
                                    {isLoading && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg z-20">
                                            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                                        </div>
                                    )}

                                    {/* QR Image */}
                                    <div className="w-24 h-24 bg-white border rounded flex items-center justify-center mb-2">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(qr.contenido)}`}
                                            alt={`QR ${qr.codigo}`}
                                            className="w-20 h-20"
                                        />
                                    </div>

                                    {/* Código */}
                                    <p className="font-bold text-sm text-center">{qr.codigo}</p>

                                    {/* Estado */}
                                    <Badge className={`mt-2 text-xs ${getEstadoColor(qr.estado)} ${
                                        qr.estado === 'anulado' ? 'line-through' : ''
                                    }`}>
                                        {qr.estado}
                                    </Badge>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Empty state */}
            {!loading && qrs.length === 0 && (
                <div className="text-center py-12">
                    <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No se encontraron QRs en este lote</p>
                </div>
            )}

            {/* Floating Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white border shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-700">
                            {selectedIds.size} seleccionado{selectedIds.size > 1 ? 's' : ''}
                        </span>
                        <div className="h-6 w-px bg-gray-200" />
                        <Button
                            variant="outline"
                            className="border-amber-400 text-amber-700 hover:bg-amber-50"
                            onClick={handleAnularSelected}
                            disabled={actionLoading === 'batch-anular'}
                        >
                            {actionLoading === 'batch-anular' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Ban className="mr-2 h-4 w-4" />
                            )}
                            Anular Seleccionados
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteSelected}
                            disabled={actionLoading === 'batch-delete'}
                        >
                            {actionLoading === 'batch-delete' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Eliminar Seleccionados
                        </Button>
                        <div className="h-6 w-px bg-gray-200" />
                        <Button variant="ghost" size="sm" onClick={clearSelection}>
                            <XIcon className="h-4 w-4 mr-1" />
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={confirmTitle}
                description={confirmDescription}
                onConfirm={async () => {
                    if (confirmAction) {
                        await confirmAction();
                    }
                }}
                destructive={confirmDestructive}
                confirmText={confirmDestructive ? 'Eliminar' : 'Confirmar'}
            />
        </div>
    );
}
