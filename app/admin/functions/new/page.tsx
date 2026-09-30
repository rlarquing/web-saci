"use client"
import * as React from "react";
import Link from "next/link";
import { useRef, useState } from "react";
import { MessageModel} from "@/models";
import { FunctionModel } from "../models";
import { functions } from "../routers/function.router";
import { useRouter } from "next/navigation";
import { useStoreContext } from "@/contexts/store.context";
import FormFunction from "../components/form-function.component";
import { create } from "../services/function.service";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Save, List, SaveAll } from "lucide-react";
import { toast } from 'sonner';

export default function New() {
    const { store, setStore }: any = useStoreContext();
    const router = useRouter();
    const crearNuevo = useRef(false);
    const [formKey, setFormKey] = useState(0);

    async function onSubmitCreate(formData: FunctionModel) {
        try {
            const response: MessageModel = await create(formData);
            if (response.statusCode===200) {
                response.message = 'La función se ha creado correctamente.'
                setStore({ ...store, messageModel: response });
                toast.success('La función se ha creado correctamente.');
                if (!crearNuevo.current) {
                    router.push(functions.index);
                } else {
                    setFormKey(k => k + 1);
                }
            } else {
                toast.error(response.message || 'Error al crear la función');
                console.log(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Error inesperado al crear la función');
            console.log(error.message);
        }
    }

    return (
        <Card className="w-full mb-4">
            <CardHeader className="rounded-t-lg" style={{ background: '#0f766e', color: 'white' }}>
                <CardTitle>Nueva función</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <FormFunction key={formKey} onSubmitForm={onSubmitCreate}>
                    <div className="flex justify-center gap-4 mt-6">
                        <Button type="submit" onClick={() => crearNuevo.current = false} className="bg-green-600 hover:bg-green-700">
                            <Save className="mr-2 h-4 w-4" />
                            Guardar
                        </Button>
                        <Button type="submit" onClick={() => crearNuevo.current = true} className="bg-blue-600 hover:bg-blue-700">
                            <SaveAll className="mr-2 h-4 w-4" />
                            Guardar y continuar
                        </Button>
                        <Link href={functions.index}>
                            <Button variant="outline">
                                <List className="mr-2 h-4 w-4" />
                                Listar
                            </Button>
                        </Link>
                    </div>
                </FormFunction>
            </CardContent>
        </Card>
    )
}
