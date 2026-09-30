"use client"
import dynamic from "next/dynamic";
import {SearchInput} from "@/components/search-input.component";
import Link from "next/link";
import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { trazas } from "./routers/log-history.router";
import {findAll, search} from "./services/log-history.service";
import { LogHistory } from "./models/log-history.model";
import type { DataColumnDef } from "@/components/DataTable/data-table.component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Pencil, Trash2, XCircle, Database, Globe, Eye, User } from "lucide-react";
import dayjs from "dayjs";
import 'dayjs/locale/es-us';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const DataTable = dynamic(
  () => import("@/components/DataTable/data-table.component").then(mod => mod.DataTable),
  { ssr: false, loading: () => <div>Cargando...</div> }
);

const getActionConfig = (action: string) => {
    switch (action) {
        case 'Adicionar':
            return { label: 'Adicionar', color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100', icon: Plus };
        case 'Modificar':
            return { label: 'Modificar', color: 'bg-amber-100 text-amber-800 hover:bg-amber-100', icon: Pencil };
        case 'Eliminar':
            return { label: 'Eliminar', color: 'bg-red-100 text-red-800 hover:bg-red-100', icon: Trash2 };
        case 'Eliminar_completamente':
            return { label: 'Elim. Total', color: 'bg-red-200 text-red-900 hover:bg-red-200', icon: XCircle };
        default:
            return { label: action, color: 'bg-gray-100 text-gray-800 hover:bg-gray-100', icon: Database };
    }
};

/** Trunca un ID largo tipo ObjectId para mostrar */
const truncateObjectId = (id: string): string => {
    if (!id) return '—';
    if (id.length <= 12) return id;
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
};

export default function Index() {
    const [data, setData] = useState<any>({});
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [buscar, setBuscar] = useState('');
    
    useEffect(() => {
        (async (): Promise<void> => {
            if (buscar!==''){
                setData(await search(buscar, paginationModel.pageSize, paginationModel.page + 1));
            }else{
                setData(await findAll(paginationModel.pageSize, paginationModel.page + 1));
            }
        })();
    }, [paginationModel]);

    const handleSearch = async (value: string): Promise<void> => {
        setBuscar(value);
        setPaginationModel({
            page: 0,
            pageSize: 10,
        })
        setData(await search(value, 10, 1));
    }

    const dataTableToolBar = (
            <div className="flex items-center gap-2">
                <SearchInput id={'buscar'} placeholder={'Buscar traza...'} buscar={handleSearch}/>
            </div>
    );

    const columns: DataColumnDef<LogHistory>[] = useMemo(() => [
        {
            accessorKey: 'action',
            header: 'Acción',
            cell: ({ row }) => {
                const action = row.original.action;
                const config = getActionConfig(action);
                const Icon = config.icon;
                return (
                    <Badge variant="secondary" className={`${config.color} gap-1 font-medium`}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'model',
            header: 'Entidad',
            cell: ({ row }) => {
                const model = row.original.model || '';
                const displayModel = model.replace(/Entity$/, '');
                return (
                    <Badge variant="outline" className="gap-1 text-slate-600 border-slate-300">
                        <Database className="h-3 w-3" />
                        {displayModel}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'user',
            header: 'Usuario',
            cell: ({ row }) => {
                const userName = row.original.user;
                if (!userName) return <span className="text-xs text-muted-foreground">—</span>;
                return (
                    <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">{userName}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'record',
            header: 'Registro',
            cell: ({ row }) => {
                const record = row.original.record;
                if (!record) return <span className="text-xs text-muted-foreground">—</span>;
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger
                                render={<code className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-mono cursor-default" />}
                            >
                                {truncateObjectId(record)}
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs font-mono">
                                {record}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            accessorKey: 'date',
            header: 'Fecha',
            cell: ({ row }) => {
                const dateStr = row.original.date;
                if (!dateStr) return <span className="text-xs text-muted-foreground">—</span>;
                const dayjsDate = dayjs(dateStr, 'dddd, D [de] MMMM [de] YYYY H:mm', 'es-us');
                const relative = dayjsDate.isValid() ? dayjsDate.fromNow() : '';
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger
                                render={<span className="text-sm text-muted-foreground cursor-default whitespace-nowrap" />}
                            >
                                {relative || dateStr}
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                {dateStr}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            accessorKey: 'direccionIp',
            header: 'IP',
            cell: ({ row }) => {
                const ip = row.original.direccionIp;
                if (!ip) return <span className="text-xs text-muted-foreground">—</span>;
                return (
                    <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <code className="text-xs font-mono">{ip}</code>
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <Link href={`${trazas.show.replace('[id]', row.original.id)}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" style={{ color: '#0f766e' }} />
                    </Button>
                </Link>
            ),
        },
    ], []);

    return (
        <DataTable 
            title={'Trazas — Historial de Auditoría'}
            data={data}
            columns={columns}
            toolBar={dataTableToolBar} 
            checkboxSelection={false}  
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel} 
            headerBackground='#f3f0f2' 
            headerColor='#0f766e' 
        />
    )
}
