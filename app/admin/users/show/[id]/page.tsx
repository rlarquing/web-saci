"use client"
import {use, useEffect, useState} from "react";
import Link from "next/link";
import * as React from "react";
import { users } from "../../routers/user.router";
import { BtnDelete } from "@/components/btn-delete.component";
import { deleteUser, findById } from "../../services/user.service";
import { MessageModel } from "@/models";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { List, Edit, Trash2 } from "lucide-react";

export default function Show({ params }: any) {
    const unwrappedParams: any = use(params);
    const id: string = unwrappedParams.id;
    const [data, setData] = useState<any>({});

    async function borrar(): Promise<any> {
        if (id) {
            const messageModel: MessageModel = await deleteUser(id);
            return { ruta: users.index, messageModel };
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
                    <CardTitle>Datos del usuario: {data.userName}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card className="border">
                            <CardContent className="pt-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">Usuario:</h3>
                                        <p className="text-gray-600">{data.userName}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Email:</h3>
                                        <p className="text-gray-600">{data.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border">
                            <CardContent className="pt-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">Roles:</h3>
                                        <p className="text-gray-600">
                                            {data && data.roles && Array.isArray(data.roles) ? data.roles.map((rol: any) => rol.label).toString() : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Funciones:</h3>
                                        <p className="text-gray-600">
                                            {data && data.funciones && Array.isArray(data.funciones) && data.funciones.length > 0 ? data.funciones.map((funcion: any) => funcion.label).toString() : 'Sin funciones particulares'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Almacenes:</h3>
                                        <p className="text-gray-600">
                                            {data && data.almacenes && Array.isArray(data.almacenes) && data.almacenes.length > 0 ? data.almacenes.map((almacen: any) => almacen.label).toString() : 'Sin almacenes asignados'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex justify-center gap-4">
                        <Link href={users.index}>
                            <Button variant="outline">
                                <List className="mr-2 h-4 w-4" />
                                Listar
                            </Button>
                        </Link>
                        <Link href={`${users.edit.replace('[id]', data.id)}`}>
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
