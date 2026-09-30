"use client"
import {useState, useEffect, use} from "react";
import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import {useStoreContext} from "@/contexts/store.context";
import {NomencladorModel} from "../../../models";
import {MessageModel} from "@/models";
import {deleteNomenclador, findById, update} from "../../../services/nomenclator.service";
import {nomenclators} from "../../../routers/nomenclator.router";
import {BtnDelete} from "@/components/btn-delete.component";
import FormNomenclador from "../../../components/form-nomenclador.component";
import {aInicialMayuscula} from "@/utilities/a-inicial-mayuscula.utility";
import {quitarSeperador} from "@/utilities/quitar-seperador.utility";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { List, Save } from "lucide-react";

export default function EditPage({ params }: any) {
    const unwrappedParams: any = use(params);
    const name: string = unwrappedParams.name;
    const id: string = unwrappedParams.id;
    const { store, setStore }: any = useStoreContext();
    const router = useRouter();
    const [data, setData] = useState<any>({});

    async function onSubmitEdit(formData: NomencladorModel) {
        try {
            const response: MessageModel = await update(quitarSeperador(params.name, '-'), params.id, formData);
            if (response.statusCode === 200) {
                response.message = 'El nomenclador se ha actualizado corectamente.'
                setStore({ ...store, messageModel: response });
                router.push(nomenclators.index.replace('[name]', params.name));
            } else {
                setStore({ ...store, messageModel: response });
                console.log(response.message);
            }
        } catch (error: any) {
            console.log(error.message);
        }
    }

    async function borrar(): Promise<any> {
        const messageModel: MessageModel = await deleteNomenclador(quitarSeperador(name, '-'), id);
        return { ruta: nomenclators.index.replace('[name]', name), messageModel };
    }

    useEffect(() => {
        (async () => {
            setData(await findById(quitarSeperador(name, '-'), id));
        })();
    }, []);

    return (
        <Card className="w-full mb-4">
            <CardHeader className="rounded-t-lg" style={{ background: '#0f766e', color: 'white' }}>
                <CardTitle>Editar nomenclador {aInicialMayuscula(name)} ({data.nombre})</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <FormNomenclador onSubmitForm={onSubmitEdit} formValues={data}>
                    <div className="flex justify-center gap-4 mt-6">
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            <Save className="mr-2 h-4 w-4" />
                            Actualizar
                        </Button>
                        <BtnDelete handleOk={borrar} />
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
