"use client"
import {use, useEffect, useState} from "react";
import Link from "next/link";
import * as React from "react";
import { rols } from "../../routers/rol.router";
import { BtnDelete } from "@/components/btn-delete.component";
import { deleteRol, findById } from "../../services/rol.service";
import { MessageModel } from "@/models";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { List, Edit } from "lucide-react";

export default function Show({ params }: any) {
    const unwrappedParams: any = use(params);
    const id: string = unwrappedParams.id;
    const [data, setData] = useState<any>({});

    async function borrar(): Promise<any> {
        if (id) {
            const messageModel: MessageModel = await deleteRol(id);
            return { ruta: rols.index, messageModel };
        }
    }

    useEffect(() => {
        (async () => {
            setData(await findById(id));
        })();
    }, []);

    return (
        <>
            <Card className="w-full mb-4">
                <CardHeader className="rounded-t-lg" style={{ background: '#0f766e', color: 'white' }}>
                    <CardTitle>Datos del rol: {data.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="border">
                            <CardContent className="pt-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">Rol:</h3>
                                        <p className="text-gray-600">{data.nombre}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Descripción:</h3>
                                        <p className="text-gray-600">{data.descripcion}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border">
                            <CardContent className="pt-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">Usuarios:</h3>
                                        <p className="text-gray-600">
                                            {data && data.users && Array.isArray(data.users) ? data.users.map((user: any) => user.label).join(', ') : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Funciones:</h3>
                                        <p className="text-gray-600">
                                            {data && data.funciones && Array.isArray(data.funciones) ? data.funciones.map((funcion: any) => funcion.label).join(', ') : 'Sin funciones particulares'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex justify-center gap-4">
                        <Link href={rols.index}>
                            <Button variant="outline">
                                <List className="mr-2 h-4 w-4" />
                                Listar
                            </Button>
                        </Link>
                        <Link href={`${rols.edit.replace('[id]', data.id)}`}>
                            <Button className="bg-green-600 hover:bg-green-700">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                        <BtnDelete handleOk={borrar} />
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
