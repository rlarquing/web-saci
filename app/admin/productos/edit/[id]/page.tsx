"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { productos } from "../../routers/producto.router";
import { update, selectNomenclador } from "../../services/producto.service";
import { FotoProducto } from "../../components/foto-producto.component";
import { get } from "@/utilities";
import { producto } from "../../endpoints/producto.endpoint";

export default function EditProducto() {
    const router = useRouter();
    const params: any = useParams();
    const id = params?.id;
    const [categorias, setCategorias] = useState<any[]>([]);
    const [unidades, setUnidades] = useState<any[]>([]);
    const [tieneFoto, setTieneFoto] = useState(false);
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<any>();

    useEffect(() => {
        (async (): Promise<void> => {
            setCategorias(await selectNomenclador('categoria'));
            setUnidades(await selectNomenclador('unidad'));
            const data = await get(producto.get.replace('{id}', id), true);
            if (data?.obj) {
                setTieneFoto(data.obj.hasFoto === true || data.obj.hasFoto === 'Si');
                reset({
                    nombre: data.obj.nombre,
                    descripcion: data.obj.descripcion,
                    categoriaId: data.obj.categoriaId,
                    unidadId: data.obj.unidadId,
                    stockMinimo: data.obj.stockMinimo,
                });
            }
        })();
    }, [id]);

    const onSubmit = async (values: any) => {
        const respuesta = await update(id, values);
        if (respuesta.type === "success") {
            toast.success(respuesta.message || 'Producto actualizado');
            router.push(productos.index);
        } else {
            toast.error(respuesta.message || 'Error al actualizar');
        }
    };

    return (
        <div className="mx-auto max-w-2xl p-4">
            <Card>
                <CardHeader><CardTitle>Editar producto</CardTitle></CardHeader>
                <CardContent>
                    <div className="mb-5 border-b pb-5">
                        <FotoProducto id={id} tieneFoto={tieneFoto} />
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input id="nombre" {...register("nombre", { required: true })} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Textarea id="descripcion" rows={2} {...register("descripcion")} />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="categoriaId">Categoría</Label>
                                <select id="categoriaId" className="w-full rounded-md border p-2" {...register("categoriaId")}>
                                    {categorias.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="unidadId">Unidad</Label>
                                <select id="unidadId" className="w-full rounded-md border p-2" {...register("unidadId")}>
                                    {unidades.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="stockMinimo">Stock mínimo (alerta)</Label>
                            <Input id="stockMinimo" type="number" min={0} {...register("stockMinimo")} />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => router.push(productos.index)}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting}>Guardar</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
