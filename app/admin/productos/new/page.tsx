"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { productos } from "../routers/producto.router";
import { create, selectNomenclador } from "../services/producto.service";

export default function NewProducto() {
    const router = useRouter();
    const [categorias, setCategorias] = useState<any[]>([]);
    const [unidades, setUnidades] = useState<any[]>([]);
    const { register, handleSubmit, formState: { isSubmitting } } = useForm<any>();

    useEffect(() => {
        (async (): Promise<void> => {
            setCategorias(await selectNomenclador('categoria'));
            setUnidades(await selectNomenclador('unidad'));
        })();
    }, []);

    const onSubmit = async (values: any) => {
        const respuesta = await create(values);
        if (respuesta.type === "success") {
            toast.success(respuesta.message || 'Producto creado');
            router.push(productos.index);
        } else {
            toast.error(respuesta.message || 'Error al crear el producto');
        }
    };

    return (
        <div className="mx-auto max-w-2xl p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Nuevo producto (SKU autogenerado PRD-XXXXXX)</CardTitle>
                </CardHeader>
                <CardContent>
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
                                <select id="categoriaId" className="w-full rounded-md border p-2" {...register("categoriaId", { required: true })}>
                                    <option value="">Seleccione…</option>
                                    {categorias.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="unidadId">Unidad</Label>
                                <select id="unidadId" className="w-full rounded-md border p-2" {...register("unidadId", { required: true })}>
                                    <option value="">Seleccione…</option>
                                    {unidades.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="stockMinimo">Stock mínimo global (alerta)</Label>
                                <Input id="stockMinimo" type="number" min={0} defaultValue={0} {...register("stockMinimo")} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="stockSeguridad">Stock de seguridad global</Label>
                                <Input id="stockSeguridad" type="number" min={0} defaultValue={0} {...register("stockSeguridad")} />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Punto de reorden = mínimo + seguridad. Para umbrales por almacén usa el módulo «Niveles».
                        </p>
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
