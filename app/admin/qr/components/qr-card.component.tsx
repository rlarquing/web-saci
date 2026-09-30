import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReadQr } from '../models';

interface QrCardProps {
    qr: ReadQr;
}

/**
 * Componente que muestra un QR con su información
 */
export function QrCard({ qr }: QrCardProps) {
    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'disponible':
                return 'bg-green-100 text-green-800';
            case 'usado':
                return 'bg-blue-100 text-blue-800';
            case 'anulado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card className="w-[220px] shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex flex-col items-center">
                {/* Imagen del QR */}
                <div className="w-32 h-32 bg-white border rounded-lg flex items-center justify-center mb-3">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qr.contenido)}`}
                        alt={`QR ${qr.codigo}`}
                        className="w-28 h-28"
                    />
                </div>

                {/* Código del QR */}
                <div className="text-center">
                    <p className="font-bold text-lg text-gray-900">{qr.codigo}</p>
                    <p className="text-sm text-gray-600">{qr.productoNombre}</p>
                    {qr.almacenNombre && (
                        <p className="text-xs text-gray-500 mt-0.5">{qr.almacenNombre}</p>
                    )}
                    <Badge className={`mt-2 ${getEstadoColor(qr.estado)}`}>
                        {qr.estado}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
