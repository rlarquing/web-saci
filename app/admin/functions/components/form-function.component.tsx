"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ComboBox } from "@/components/combo-box.component"
import { TransferList } from "@/components/transfer-list.component"
import { FunctionModel } from "../models"
import { createSelectEndPoints } from "@/services/end-point.service"
import { createSelectMenus } from "../../menus/services/menu.service"
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

interface FormFunctionProps {
  children: any
  formValues?: Partial<FunctionModel>
  onSubmitForm: (data: FunctionModel) => void
}

// Schema de validación con Zod
const formSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  descripcion: z.string().optional(),
  endPoints: z.array(z.string()).min(1, "Seleccione al menos un endpoint"),
  menu: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

async function getData(): Promise<{ endPoints: any[]; menus: any[] }> {
  const endPoints = await createSelectEndPoints()
  const menus = await createSelectMenus()
  return { endPoints: Array.isArray(endPoints) ? endPoints : [], menus: Array.isArray(menus) ? menus : [] }
}

export default function FormFunction({ children, formValues, onSubmitForm }: FormFunctionProps) {
  const [selectEndPoints, setSelectEndpoints] = useState<any[] | null>(null)
  const [selectMenus, setSelectMenus] = useState<any[] | null>(null)

  // Cargar datos para los ComboBox
  useEffect(() => {
    ;(async () => {
      const data = await getData()
      setSelectEndpoints(data.endPoints)
      setSelectMenus(data.menus)
    })()
  }, [])

  // 1. Definir el formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: formValues?.nombre || "",
      descripcion: formValues?.descripcion || "",
      endPoints: formValues?.endPoints?.map(String) || [],
      menu: formValues?.menu?.toString() || undefined,
    },
  })

  // Actualizar valores del formulario cuando llegan los datos asíncronos
  useEffect(() => {
    if (formValues && Object.keys(formValues).length > 0) {
      form.reset({
        nombre: formValues?.nombre || "",
        descripcion: formValues?.descripcion || "",
        endPoints: formValues?.endPoints?.map(String) || [],
        menu: formValues?.menu?.toString() || undefined,
      })
    }
  }, [formValues, form])

   // 2. Definir el handler de submit
   function onSubmit(values: FormValues) {
     const formData: FunctionModel = {
       nombre: values.nombre,
       descripcion: values.descripcion ?? "",
       endPoints: values.endPoints?.map(String) || [],
       menu: values.menu ? String(values.menu) : undefined,
     }

    onSubmitForm(formData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Escriba el nombre de la función" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input placeholder="Escriba la descripción de la función" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endPoints"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>End Points</FormLabel>
                    <FormControl>
                      <TransferList
                        items={selectEndPoints ?? []}
                        selected={field.value ?? []}
                        onChange={(values) => {
                          field.onChange(values)
                          // Re-valida al toque para limpiar error si ya hay endpoints
                          form.trigger("endPoints")
                        }}
                        searchPlaceholder="Buscar endpoint..."
                        emptyText="No hay endpoints disponibles"
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
                    <FormLabel>Menú</FormLabel>
                    <FormControl>
                      <ComboBox
                        id="menu"
                        value={field.value as any}
                        setValue={field.onChange}
                        options={selectMenus ?? []}
                        width={"100%"}
                        helperText={"Menú que utiliza la función."}
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
