"use client"
import {formatearNombre, quitarSeperador} from "@/utilities";
import * as React from "react";
import Link from "next/link";
import {nomenclators} from "../../routers/nomenclator.router";
import FormNomenclador from "../../components/form-nomenclador.component";
import {use, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {useStoreContext} from "@/contexts/store.context";
import {MessageModel} from "@/models";
import {create} from "../../services/nomenclator.service";
import {NomencladorModel} from "../../models";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Save, List, SaveAll } from "lucide-react";
import { toast } from 'sonner';

export default function New({params}: any) {
    const unwrappedParams: any = use(params);
    const name: string = unwrappedParams.name;
    const { store, setStore }: any = useStoreContext();
    const router = useRouter();
    const crearNuevo = useRef(false);
    const [formKey, setFormKey] = useState(0);

    async function onSubmitCreate(formData: NomencladorModel) {
        try {
            const response: MessageModel = await create(quitarSeperador(name, '-'), formData);
            if (response.statusCode===200) {
                response.message = 'El nomenclador se ha creado correctamente.'
                setStore({ ...store, messageModel: response });
                toast.success('El nomenclador se ha creado correctamente.');
                if (!crearNuevo.current) {
                    router.push(nomenclators.index.replace('[name]', name));
                } else {
                    setFormKey(k => k + 1);
                }
            } else {
                toast.error(response.message || 'Error al crear el nomenclador');
                console.log(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Error inesperado al crear el nomenclador');
            console.log(error.message);
        }
    }

    return (
        <Card className="w-full mb-4">
            <CardHeader className="rounded-t-lg" style={{ background: '#0f766e', color: 'white' }}>
                <CardTitle>Nuevo nomenclador de {formatearNombre(name, ' ')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <FormNomenclador key={formKey} onSubmitForm={onSubmitCreate}>
                    <div className="flex justify-center gap-4 mt-6">
                        <Button type="submit" onClick={() => crearNuevo.current = false} className="bg-green-600 hover:bg-green-700">
                            <Save className="mr-2 h-4 w-4" />
                            Guardar
                        </Button>
                        <Button type="submit" onClick={() => crearNuevo.current = true} className="bg-blue-600 hover:bg-blue-700">
                            <SaveAll className="mr-2 h-4 w-4" />
                            Guardar y continuar
                        </Button>
                        <Link href={nomenclators.index.replace('[name]', name)}>
                            <Button variant="outline">
                                <List className="mr-2 h-4 w-4" />
                                Listar
                            </Button>
                        </Link>
                    </div>
                </FormNomenclador>
            </CardContent>
        </Card>
    )
}
