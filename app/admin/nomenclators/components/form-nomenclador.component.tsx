"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { NomencladorModel } from "../models"
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
import { useEffect } from "react"

interface FormNomencladorProps {
  children: any
  formValues?: Partial<NomencladorModel>
  onSubmitForm: (data: NomencladorModel) => void
}

// Schema de validación con Zod
const formSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  descripcion: z.string().min(2, "Mínimo 2 caracteres"),
})

type FormValues = z.infer<typeof formSchema>

export default function FormNomenclador({ children, formValues, onSubmitForm }: FormNomencladorProps) {
  // 1. Definir el formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
    },
  })

  // 2. Sincronizar formValues cuando lleguen asincrónicamente (ej: edit)
  useEffect(() => {
    form.reset({
      nombre: formValues?.nombre || "",
      descripcion: formValues?.descripcion || "",
    })
  }, [formValues, form])

  // 3. Definir el handler de submit
  function onSubmit(values: FormValues) {
    const formData: NomencladorModel = {
      nombre: values.nombre,
      descripcion: values.descripcion,
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
                      <Input placeholder="Escriba el nombre" {...field} />
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
                      <Input placeholder="Descripción" {...field} />
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