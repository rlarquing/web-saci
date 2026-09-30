"use client"
import {useState, useEffect} from "react";
import Link from "next/link";
import * as React from "react";
import {functions} from "../../routers/function.router";
import { BtnDelete } from "@/components/btn-delete.component";
import { deleteFunction, findById } from "../../services/function.service";
import { MessageModel } from "@/models";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { List, Edit } from "lucide-react";

export default function Show({ params }: any) {
    const [data, setData] = useState<any>({});

    async function borrar(): Promise<any> {
        if (params && params.id) {
            const messageModel: MessageModel = await deleteFunction(params.id);
            return { ruta: functions.index, messageModel };
        }
    }

    useEffect(() => {
        (async () => {
            setData(await findById(params.id));
        })();
    }, []);

    return (
        <Card className="w-full mb-4">
            <CardHeader className="rounded-t-lg" style={{ background: '#0f766e', color: 'white' }}>
                <CardTitle>Datos de la función: {data.nombre}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="border">
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg">Función:</h3>
                                    <p className="text-gray-600">{data.nombre}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Descripción:</h3>
                                    <p className="text-gray-600">{data.descripcion}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border md:col-span-2">
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg">EndPoints:</h3>
                                    <p className="text-gray-600">
                                        {data && data.endPoints ? data.endPoints.map((ep: any) => ep.label).join(', ') : ''}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Menú:</h3>
                                    <p className="text-gray-600">{data && data.menu ? data.menu.label : ''}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex justify-center gap-4">
                    <Link href={functions.index}>
                        <Button variant="outline">
                            <List className="mr-2 h-4 w-4" />
                            Listar
                        </Button>
                    </Link>
                    <Link href={`${functions.edit.replace('[id]', data.id)}`}>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    </Link>
                    <BtnDelete handleOk={borrar} />
                </div>
            </CardContent>
        </Card>
    )
}
