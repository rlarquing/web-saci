"use client"
import * as React from "react";
import Link from "next/link";
import {useRef, useState} from "react";
import FormRol from "../components/form-role.component";
import { useRouter } from "next/navigation";
import { useStoreContext } from "@/contexts/store.context";
import { create } from "../services/rol.service";
import { RolModel } from "../models";
import { MessageModel } from "@/models";
import { rols } from "../routers/rol.router";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Save, List, SaveAll } from "lucide-react";
import { toast } from 'sonner';

export default function New() {
    const { store, setStore }: any = useStoreContext();
    const router = useRouter();
    const crearNuevo = useRef(false);
    const [formKey, setFormKey] = useState(0);

    async function onSubmitCreate(formData: RolModel) {
        try {
            const response: MessageModel = await create(formData);
            if (response.statusCode===200) {
                response.message = 'El rol se ha creado correctamente.'
                setStore({ ...store, messageModel: response });
                toast.success('El rol se ha creado correctamente.');
                if (!crearNuevo.current) {
                    router.push(rols.index);
                } else {
                    setFormKey(k => k + 1);
                }
            } else {
                toast.error(response.message || 'Error al crear el rol');
                console.log(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Error inesperado al crear el rol');
            console.log(error.message);
        }
    }

    return (
        <Card className="w-full mb-4">
            <CardHeader className="rounded-t-lg" style={{ background: '#0f766e', color: 'white' }}>
                <CardTitle>Nuevo rol</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <FormRol key={formKey} onSubmitForm={onSubmitCreate}>
                    <div className="flex justify-center gap-4 mt-6">
                        <Button type="submit" onClick={() => crearNuevo.current = false} className="bg-green-600 hover:bg-green-700">
                            <Save className="mr-2 h-4 w-4" />
                            Guardar
                        </Button>
                        <Button type="submit" onClick={() => crearNuevo.current = true} className="bg-blue-600 hover:bg-blue-700">
                            <SaveAll className="mr-2 h-4 w-4" />
                            Guardar y continuar
                        </Button>
                        <Link href={rols.index}>
                            <Button variant="outline">
                                <List className="mr-2 h-4 w-4" />
                                Listar
                            </Button>
                        </Link>
                    </div>
                </FormRol>
            </CardContent>
        </Card>
    )
}
