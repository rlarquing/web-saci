"use client"
import {useState, useEffect, use} from "react";
import Link from "next/link";
import {functions} from "../../routers/function.router";
import { useRouter } from "next/navigation";
import { FunctionModel } from "../../models";
import { deleteFunction, findById, update } from "../../services/function.service";
import { BtnDelete } from "@/components/btn-delete.component";
import { MessageModel } from "@/models";
import { useStoreContext } from "@/contexts/store.context";
import FormFunction from "../../components/form-function.component";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { List, Save } from "lucide-react";
import { toast } from 'sonner';

export default function EditPage({ params }: any) {
    const unwrappedParams: any = use(params);
    const id: string = unwrappedParams.id;
    const { store, setStore }: any = useStoreContext();
    const router = useRouter();
    const [data, setData] = useState<any>({});

    async function onSubmitEdit(formData: FunctionModel) {
        try {
            const response: MessageModel = await update(id, formData);
            if (response.statusCode === 200) {
                response.message = 'La función se ha actualizado correctamente.'
                setStore({ ...store, messageModel: response });
                toast.success('La función se ha actualizado correctamente.');
                router.push(functions.index);
            } else {
                toast.error(response.message || 'Error al actualizar la función');
                console.log(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Error inesperado al actualizar la función');
            console.log(error.message);
        }
    }

    async function borrar(): Promise<any> {
        const messageModel: MessageModel = await deleteFunction(id);
        return { ruta: functions.index, messageModel };
    }
    
    useEffect(() => {
        (async () => {
            setData(await findById(id));
        })();
    }, []);

    return (
        <Card className="w-full mb-4">
            <CardHeader className="rounded-t-lg" style={{ background: '#0f766e', color: 'white' }}>
                <CardTitle>Editar función: {data.nombre ? data.nombre : ''}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <FormFunction onSubmitForm={onSubmitEdit} formValues={data}>
                    <div className="flex justify-center gap-4 mt-6">
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            <Save className="mr-2 h-4 w-4" />
                            Actualizar
                        </Button>
                        <BtnDelete handleOk={borrar} />
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
