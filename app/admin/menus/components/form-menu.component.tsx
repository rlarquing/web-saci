"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ComboBox, createOptions } from "@/components/combo-box.component"
import { MenuModel } from "../models"
import { createSelectMenus } from "../services/menu.service"
import { Card, CardContent } from "@/components/ui/card"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"

// Opciones predefinidas para el campo tipo
const TIPO_OPTIONS = createOptions([
    { value: "administracion", label: "Administración" },
    { value: "interno", label: "Interno" },
    { value: "reporte", label: "Reporte" },
    { value: "grafico", label: "Gráfico" },
])

interface FormMenuProps {
    children: any
    formValues?: Partial<MenuModel>
    onSubmitForm: (data: MenuModel) => void
}

// Schema de validación con Zod
const formSchema = z.object({
    label: z.string().min(2, "Mínimo 2 caracteres"),
    icon: z.string().min(2, "Mínimo 2 caracteres"),
    to: z.string().min(2, "Mínimo 2 caracteres"),
    tipo: z.string().min(2, "Mínimo 2 caracteres"),
    menu: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

async function getData(): Promise<{ menus: any[] }> {
    const menus = await createSelectMenus()
    return { menus: Array.isArray(menus) ? menus : [] }
}

export default function FormMenu({ children, formValues, onSubmitForm }: FormMenuProps) {
    const [selectMenus, setSelectMenus] = useState<any[]>([])

    // Cargar datos para los ComboBox
    useEffect(() => {
        ;(async () => {
            const data = await getData()
            setSelectMenus(data.menus)
        })()
    }, [])

    // 1. Definir el formulario
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            label: formValues?.label || "",
            icon: formValues?.icon || "",
            to: formValues?.to || "",
            tipo: formValues?.tipo || "",
            menu: formValues?.menu?.toString() || undefined,
        },
    })

    // Actualizar valores del formulario cuando llegan los datos asíncronos
    useEffect(() => {
        if (formValues && Object.keys(formValues).length > 0) {
            form.reset({
                label: formValues?.label || "",
                icon: formValues?.icon || "",
                to: formValues?.to || "",
                tipo: formValues?.tipo || "",
                menu: formValues?.menu?.toString() || undefined,
            })
        }
    }, [formValues, form, selectMenus])

    // 2. Definir el handler de submit
    function onSubmit(values: FormValues) {
        const formData: MenuModel = {
            label: values.label,
            icon: values.icon,
            to: values.to,
            tipo: values.tipo,
            menu: values.menu ? values.menu : undefined,
        }

        onSubmitForm(formData)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="label"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Label</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Escriba el label del menú" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Icon</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Escriba el icon del menú" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="to"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ruta</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Escriba la ruta del menú" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tipo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <FormControl>
                                            <ComboBox
                                                id="tipo"
                                                value={field.value as any}
                                                setValue={field.onChange}
                                                options={TIPO_OPTIONS}
                                                width={"100%"}
                                                helperText={"Tipo de menú."}
                                                multiple={false}
                                                placeholder="Seleccione el tipo"
                                                searchPlaceholder="Buscar tipo..."
                                                emptyText="No se encontró el tipo"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="menu"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Menú Padre</FormLabel>
                                        <FormControl>
                                            <ComboBox
                                                id="menu"
                                                value={field.value as any}
                                                setValue={field.onChange}
                                                options={selectMenus}
                                                width={"100%"}
                                                helperText={"Menú padre (opcional)."}
                                                multiple={false}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
                {children}
            </form>
        </Form>
    )
}
