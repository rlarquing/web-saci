"use client"
import {use, useEffect, useState} from "react";
import Link from "next/link";
import { users } from "../../routers/user.router";
import FormUser from "../../components/form-user.component";
import { useRouter } from "next/navigation";
import { UserModel } from "../../models";
import { deleteUser, findById, update } from "../../services/user.service";
import { BtnDelete } from "@/components/btn-delete.component";
import { MessageModel } from "@/models";
import { useStoreContext } from "@/contexts/store.context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { List, Save } from "lucide-react";

export default function EditPage({ params }: any) {
    const unwrappedParams: any = use(params);
    const id: string = unwrappedParams.id;
    const { store, setStore }: any = useStoreContext();
    const router = useRouter();
    const [data, setData] = useState<any>({});

    async function onSubmitEdit(formData: UserModel) {
        try {
            if (formData.password === formData.confirmPassword) {
                const response: MessageModel = await update(id, formData);
                if (response.statusCode === 200) {
                    response.message = 'El usuario se ha actualizado corectamente.'
                    setStore({ ...store, messageModel: response });
                    router.push(users.index);
                } else {
                    setStore({ ...store, messageModel: response });
                    console.log(response.message);
                }
            } else {
                console.log('ERROR, Las contraseñas no son iguales!');
            }
        } catch (error: any) {
            console.log(error.message);
        }
    }

    async function borrar(): Promise<any> {
        const messageModel: MessageModel = await deleteUser(id);
        return { ruta: users.index, messageModel };
    }

    useEffect(() => {
        (async () => {
            setData(await findById(id));
        })();
    }, []);

    return (
        <Card className="w-full mb-4">
            <CardHeader className="rounded-t-lg" style={{ background: '#0f766e', color: 'white' }}>
                <CardTitle>Editar usuario: {data.userName ? data.userName : ''}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <FormUser onSubmitForm={onSubmitEdit} formValues={data}>
                    <div className="flex justify-center gap-4 mt-6">
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            <Save className="mr-2 h-4 w-4" />
                            Actualizar
                        </Button>
                        <BtnDelete handleOk={borrar} />
                        <Link href={users.index}>
                            <Button variant="outline">
                                <List className="mr-2 h-4 w-4" />
                                Listar
                            </Button>
                        </Link>
                    </div>
                </FormUser>
            </CardContent>
        </Card>
    )
}
