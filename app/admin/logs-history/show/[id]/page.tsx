"use client"
import {use, useEffect, useState} from "react";
import Link from "next/link";
import * as React from "react";
import {trazas} from "../../routers/log-history.router";
import {findById} from "../../services/log-history.service";
import { LogHistory } from "../../models/log-history.model";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft, Plus, Pencil, Trash2, XCircle,
    User, Mail, Calendar, Globe, Database, Hash, Shield,
} from "lucide-react";

const getActionConfig = (action: string) => {
    switch (action) {
        case 'Adicionar':
            return {
                label: 'Adicionar',
                gradient: 'from-emerald-500 to-green-600',
                bgLight: 'bg-emerald-50',
                borderLight: 'border-emerald-200',
                text: 'text-emerald-800',
                badgeColor: 'bg-emerald-100 text-emerald-800',
                icon: Plus,
            };
        case 'Modificar':
            return {
                label: 'Modificar',
                gradient: 'from-amber-500 to-yellow-500',
                bgLight: 'bg-amber-50',
                borderLight: 'border-amber-200',
                text: 'text-amber-800',
                badgeColor: 'bg-amber-100 text-amber-800',
                icon: Pencil,
            };
        case 'Eliminar':
            return {
                label: 'Eliminar',
                gradient: 'from-red-500 to-rose-600',
                bgLight: 'bg-red-50',
                borderLight: 'border-red-200',
                text: 'text-red-800',
                badgeColor: 'bg-red-100 text-red-800',
                icon: Trash2,
            };
        case 'Eliminar_completamente':
            return {
                label: 'Eliminación Total',
                gradient: 'from-red-800 to-rose-900',
                bgLight: 'bg-red-50',
                borderLight: 'border-red-300',
                text: 'text-red-900',
                badgeColor: 'bg-red-200 text-red-900',
                icon: XCircle,
            };
        default:
            return {
                label: action,
                gradient: 'from-gray-500 to-gray-600',
                bgLight: 'bg-gray-50',
                borderLight: 'border-gray-200',
                text: 'text-gray-800',
                badgeColor: 'bg-gray-100 text-gray-800',
                icon: Database,
            };
    }
};

const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'Sí' : 'No';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
};

const isObject = (val: any): boolean => {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
};

function KeyValueDisplay({ data, theme }: { data: any; theme: 'green' | 'red' }) {
    if (!data || typeof data !== 'object') return null;
    
    const entries = Object.entries(data);
    const colorClasses = theme === 'green' 
        ? { bg: 'bg-emerald-50/50', border: 'border-emerald-200', label: 'text-emerald-700', value: 'text-emerald-900' }
        : { bg: 'bg-red-50/50', border: 'border-red-200', label: 'text-red-700', value: 'text-red-900' };

    return (
        <div className="space-y-2">
            {entries.map(([key, val]) => (
                <div key={key} className={`rounded-lg border p-3 ${colorClasses.bg} ${colorClasses.border}`}>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${colorClasses.label}`}>
                        {key}
                    </span>
                    {isObject(val) && !Array.isArray(val) ? (
                        <pre className={`mt-1 text-sm whitespace-pre-wrap ${colorClasses.value}`}>
                            {JSON.stringify(val, null, 2)}
                        </pre>
                    ) : (
                        <p className={`mt-1 text-sm font-medium ${colorClasses.value}`}>
                            {formatValue(val)}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}

function DiffDisplay({ previousData, newData }: { previousData: any; newData: any }) {
    const prevObj = (previousData && typeof previousData === 'object') ? previousData : {};
    const newObj = (newData && typeof newData === 'object') ? newData : {};
    
    const allKeys = Array.from(new Set([...Object.keys(prevObj), ...Object.keys(newObj)]));
    
    const changes = allKeys.map(key => {
        const oldVal = prevObj[key];
        const newVal = newObj[key];
        const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
        const added = !(key in prevObj) && (key in newObj);
        const removed = (key in prevObj) && !(key in newObj);
        return { key, oldVal, newVal, changed, added, removed };
    });

    const changedCount = changes.filter(c => c.changed && !c.added && !c.removed).length;
    const addedCount = changes.filter(c => c.added).length;
    const removedCount = changes.filter(c => c.removed).length;
    const unchangedCount = changes.filter(c => !c.changed).length;

    return (
        <div className="space-y-4">
            {/* Change summary */}
            <div className="flex flex-wrap gap-2">
                {changedCount > 0 && (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        {changedCount} cambiado{changedCount > 1 ? 's' : ''}
                    </Badge>
                )}
                {addedCount > 0 && (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                        {addedCount} agregado{addedCount > 1 ? 's' : ''}
                    </Badge>
                )}
                {removedCount > 0 && (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        {removedCount} eliminado{removedCount > 1 ? 's' : ''}
                    </Badge>
                )}
                {unchangedCount > 0 && (
                    <Badge variant="outline" className="text-muted-foreground">
                        {unchangedCount} sin cambio{unchangedCount > 1 ? 's' : ''}
                    </Badge>
                )}
            </div>

            {/* Field comparison grid */}
            <div className="space-y-2">
                {changes.map(({ key, oldVal, newVal, changed, added, removed }) => (
                    <div key={key} className={`rounded-lg border p-3 ${
                        added ? 'bg-emerald-50 border-emerald-200' :
                        removed ? 'bg-red-50 border-red-200' :
                        changed ? 'bg-amber-50/50 border-amber-200' :
                        'bg-gray-50/50 border-gray-200'
                    }`}>
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            {key}
                            {added && <span className="ml-2 text-emerald-600">+nuevo</span>}
                            {removed && <span className="ml-2 text-red-600">-eliminado</span>}
                        </div>
                        
                        {added ? (
                            <div>
                                <p className="text-sm font-medium text-emerald-800">
                                    {formatValue(newVal)}
                                </p>
                            </div>
                        ) : removed ? (
                            <div>
                                <p className="text-sm line-through text-red-400">
                                    {formatValue(oldVal)}
                                </p>
                            </div>
                        ) : changed ? (
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
                                <div className="rounded bg-red-50 p-2 border border-red-200">
                                    <p className="text-xs text-red-500 mb-1">Anterior</p>
                                    <p className="text-sm line-through text-red-700">
                                        {formatValue(oldVal)}
                                    </p>
                                </div>
                                <div className="flex items-center pt-2 text-muted-foreground">
                                    →
                                </div>
                                <div className="rounded bg-emerald-50 p-2 border border-emerald-200">
                                    <p className="text-xs text-emerald-500 mb-1">Nuevo</p>
                                    <p className="text-sm font-semibold text-emerald-800">
                                        {formatValue(newVal)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {formatValue(oldVal)}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Show({ params }: any) {
    const unwrappedParams: any = use(params);
    const id: string = unwrappedParams.id;
    const [record, setRecord] = useState<LogHistory | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        (async () => {
            try {
                const result = await findById(id);
                setRecord(result as LogHistory);
            } catch (error) {
                console.error('Error loading trace:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200" style={{ borderTopColor: '#0f766e' }}></div>
            </div>
        );
    }

    if (!record) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontró la traza</p>
            </div>
        );
    }

    const config = getActionConfig(record.action);
    const HeroIcon = config.icon;
    const isModification = record.action === 'Modificar';
    const isDeletion = record.action === 'Eliminar' || record.action === 'Eliminar_completamente';
    const isAddition = record.action === 'Adicionar';

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Back button */}
            <Link href={trazas.index}>
                <Button variant="ghost" className="gap-2 hover:bg-red-50 hover:text-red-700">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Trazas
                </Button>
            </Link>

            {/* Hero Section */}
            <Card className={`overflow-hidden border-0`}>
                <div className={`bg-gradient-to-r ${config.gradient} p-8 text-white`}>
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <HeroIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{config.label}</h1>
                            <p className="text-white/80 mt-1">
                                {record.model?.replace(/Entity$/, '') || 'Registro'} — ID: {record.record || '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Info Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Información del Usuario
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Nombre</p>
                                <p className="font-medium">{record.user || '—'}</p>
                            </div>
                        </div>
                        <Separator />

                        <Separator />
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Fecha</p>
                                <p className="font-medium text-sm">{record.date || '—'}</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Dirección IP</p>
                                <code className="text-sm font-mono">{record.direccionIp || '—'}</code>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Entity Info Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Información de la Entidad
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Modelo / Tabla</p>
                                <p className="font-medium">{record.model?.replace(/Entity$/, '') || '—'}</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-3">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">ID del Registro</p>
                                <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">
                                    {record.record || '—'}
                                </code>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-3">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Tipo de Acción</p>
                                <Badge className={`${config.badgeColor} gap-1 font-medium mt-1`}>
                                    <HeroIcon className="h-3 w-3" />
                                    {config.label}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Section */}
            {isModification ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-amber-600" />
                            Comparación de Cambios
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DiffDisplay previousData={record.previousData} newData={record.data} />
                    </CardContent>
                </Card>
            ) : isAddition ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-emerald-600" />
                            Datos Agregados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <KeyValueDisplay data={record.data} theme="green" />
                    </CardContent>
                </Card>
            ) : isDeletion ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-600" />
                            Datos Eliminados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <KeyValueDisplay data={record.data} theme="red" />
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Datos del Registro
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                            {JSON.stringify(record.data, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
