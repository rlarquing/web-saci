"use client"

import dynamic from "next/dynamic";
import { SearchInput } from "@/components/search-input.component";
import * as React from "react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { registroDiariosRoutes } from "./routers/registro-diario.router";
import { findAll, search, cerrarRegistro, filtrar } from "./services/registro-diario.service";
import { RegistroDiario } from "./models/registro-diario.model";
import type { DataColumnDef } from "@/components/DataTable/data-table.component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Lock, MoreHorizontal, SearchX, CircleDot, CircleCheck, DollarSign, Car } from "lucide-react";
import Link from "next/link";

const DataTable = dynamic(
    () => import("@/components/DataTable/data-table.component").then(mod => mod.DataTable),
    { ssr: false, loading: () => <div>Cargando...</div> }
);

export default function Index() {
    const [data, setData] = useState<any>({});
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [buscar, setBuscar] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState<string>('');

    // Estado para el diálogo de confirmación de cierre
    const [cerrarDialogOpen, setCerrarDialogOpen] = useState(false);
    const [registroACerrar, setRegistroACerrar] = useState<RegistroDiario | null>(null);
    const [cerrando, setCerrando] = useState(false);

    const loadData = useCallback(async () => {
        if (buscar !== '') {
            setData(await search(buscar, paginationModel.pageSize, paginationModel.page + 1));
        } else if (estadoFiltro) {
            setData(await filtrar(['estado'], [estadoFiltro], paginationModel.pageSize, paginationModel.page + 1));
        } else {
            setData(await findAll(paginationModel.pageSize, paginationModel.page + 1));
        }
    }, [buscar, estadoFiltro, paginationModel]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSearch = async (value: string): Promise<void> => {
        setBuscar(value);
        setEstadoFiltro('');
        setPaginationModel({ page: 0, pageSize: 10 });
        setData(await search(value, 10, 1));
    };

    const handleFiltroEstado = async (estado: string) => {
        setEstadoFiltro(estado);
        setBuscar('');
        setPaginationModel({ page: 0, pageSize: 10 });
        if (estado) {
            setData(await filtrar(['estado'], [estado], 10, 1));
        } else {
            setData(await findAll(10, 1));
        }
    };

    const handleCerrarClick = (registro: RegistroDiario) => {
        setRegistroACerrar(registro);
        setCerrarDialogOpen(true);
    };

    const handleConfirmarCierre = async () => {
        if (!registroACerrar) return;
        setCerrando(true);
        try {
            await cerrarRegistro(registroACerrar.id);
            setCerrarDialogOpen(false);
            setRegistroACerrar(null);
            // Recargar datos
            await loadData();
        } catch (error) {
            console.error('Error al cerrar el registro:', error);
        } finally {
            setCerrando(false);
        }
    };

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('cu-CU', {
            style: 'currency',
            currency: 'CUP',
            minimumFractionDigits: 2,
        }).format(value);
    };

    const DataTableToolBar = () => (
        <div className="flex items-center gap-2">
            <SearchInput id={'buscar'} placeholder={'Buscar registro...'} buscar={handleSearch} />
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={<Button variant={estadoFiltro ? "default" : "outline"} size="sm" className="h-8 gap-1 text-xs" />}
                >
                    {estadoFiltro === 'abierto' ? 'Abiertos' :
                        estadoFiltro === 'cerrado' ? 'Cerrados' : 'Estado'}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleFiltroEstado('')}>
                        Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFiltroEstado('abierto')}>
                        <CircleDot className="h-3 w-3 mr-2 text-emerald-500" />
                        Abiertos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFiltroEstado('cerrado')}>
                        <CircleCheck className="h-3 w-3 mr-2 text-slate-500" />
                        Cerrados
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    const columns: DataColumnDef<RegistroDiario>[] = useMemo(() => [
        {
            accessorKey: 'fecha',
            header: 'Fecha',
            cell: ({ row }) => (
                <span className="text-sm font-medium whitespace-nowrap">
                    {row.original.fecha || '—'}
                </span>
            ),
        },
        {
            accessorKey: 'almacenNombre',
            header: 'Almacen',
            cell: ({ row }) => (
                <span className="text-sm whitespace-nowrap">
                    {row.original.almacenNombre || '—'}
                </span>
            ),
        },
        {
            accessorKey: 'estado',
            header: 'Estado',
            cell: ({ row }) => {
                const estado = row.original.estado;
                const isAbierto = estado === 'abierto';
                return (
                    <Badge
                        variant="secondary"
                        className={`gap-1 font-medium ${
                            isAbierto
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {isAbierto ? (
                            <CircleDot className="h-3 w-3" />
                        ) : (
                            <CircleCheck className="h-3 w-3" />
                        )}
                        {isAbierto ? 'Abierto' : 'Cerrado'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'totalEntradas',
            header: 'Total Unidades',
            cell: ({ row }) => (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger
                            render={<div className="flex items-center gap-1.5 cursor-default" />}
                        >
                            <Car className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-semibold">
                                {row.original.totalEntradas ?? 0}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            {row.original.totalEntradas ?? 0} vehículos atendidos
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ),
        },
        {
            accessorKey: 'totalSalidas',
            header: 'Total Salidas',
            cell: ({ row }) => (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger
                            render={<div className="flex items-center gap-1.5 cursor-default" />}
                        >
                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-semibold">
                                {formatCurrency(row.original.totalSalidas ?? 0)}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            Salidas del día
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const registro = row.original as RegistroDiario;
                const isAbierto = registro.estado === 'abierto';
                return (
                    <div className="flex items-center gap-1">
                        {/* Ver detalle */}
                        <Link href={`${registroDiariosRoutes.show.replace('[id]', registro.id)}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" style={{ color: '#0f766e' }} />
                            </Button>
                        </Link>
                        {/* Cerrar día — solo si está abierto */}
                        {isAbierto && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger
                                        render={
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-amber-50"
                                                onClick={() => handleCerrarClick(registro)}
                                            />
                                        }
                                    >
                                        <Lock className="h-4 w-4 text-amber-600" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Cerrar este registro diario
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                );
            },
        },
    ], []);

    return (
        <>
            <DataTable
                title={'Registros Diarios'}
                data={data}
                columns={columns}
                toolBar={DataTableToolBar}
                checkboxSelection={false}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                headerBackground='#f3f0f2'
                headerColor='#0f766e'
            />

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
                                ¿Está seguro de que desea cerrar el registro diario del <strong>{registroACerrar?.fecha}</strong> del almacen <strong>{registroACerrar?.almacenNombre}</strong>?
                            </p>
                            <div className="rounded-lg border bg-amber-50 p-3 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-amber-800">Total Unidades:</span>
                                    <span className="font-semibold">{registroACerrar?.totalEntradas ?? 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-amber-800">Total Salidas:</span>
                                    <span className="font-semibold">{formatCurrency(registroACerrar?.totalSalidas ?? 0)}</span>
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
        </>
    );
}
