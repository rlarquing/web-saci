"use client"
import {use, useEffect, useState} from "react";
import Link from "next/link";
import * as React from "react";
import { menus } from "../../routers/menu.router";
import { BtnDelete } from "@/components/btn-delete.component";
import { deleteMenu, findById } from "../../services/menu.service";
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
            const messageModel: MessageModel = await deleteMenu(id);
            return { ruta: menus.index, messageModel };
        }
    }

    useEffect(() => {
        (async () => {
            setData(await findById(id));
        })();
    }, []);

    return (
        <Card className="w-full mb-4">
            <CardHeader className="rounded-t-lg" style={{ background: '#0f766e', color: 'white' }}>
                <CardTitle>Datos del menú: {data.label}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card className="border">
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg">Menú:</h3>
                                    <p className="text-gray-600">{data.label}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Icon:</h3>
                                    <p className="text-gray-600">{data.icon}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg">Ruta:</h3>
                                    <p className="text-gray-600">{data.to}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Menú Padre:</h3>
                                    <p className="text-gray-600">{data && data.menu ? data.menu.label : ''}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex justify-center gap-4">
                    <Link href={menus.index}>
                        <Button variant="outline">
                            <List className="mr-2 h-4 w-4" />
                            Listar
                        </Button>
                    </Link>
                    <Link href={`${menus.edit.replace('[id]', data.id)}`}>
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
