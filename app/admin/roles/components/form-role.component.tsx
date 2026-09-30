"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ComboBox } from "@/components/combo-box.component"
import { RolModel } from "../models"
import { createSelectFuncion } from "@/app/admin/functions/services/function.service"
import { createSelectUsers } from "@/app/admin/users/services/user.service"
import { Card, CardContent } from "@/components/ui/card"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"

interface FormRolProps {
  children: any
  formValues?: Partial<RolModel>
  onSubmitForm: (data: RolModel) => void
}

// Schema de validación con Zod
const formSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  descripcion: z.string().min(2, "Mínimo 2 caracteres"),
  users: z.array(z.string()).optional(),
  funciones: z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof formSchema>

async function getData(): Promise<{ users: any[]; functions: any[] }> {
  const users = await createSelectUsers()
  const functions = await createSelectFuncion()
  return { users: Array.isArray(users) ? users : [], functions: Array.isArray(functions) ? functions : [] }
}

export default function FormRol({ children, formValues, onSubmitForm }: FormRolProps) {
  const [selectUsuarios, setSelectUsuarios] = useState<any[]>([])
  const [selectFunciones, setSelectFunciones] = useState<any[]>([])

  // Cargar datos para los ComboBox
  useEffect(() => {
    ;(async () => {
      const data = await getData()
      setSelectUsuarios(data.users)
      setSelectFunciones(data.functions)
    })()
  }, [])

  // 1. Definir el formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: formValues?.nombre || "",
      descripcion: formValues?.descripcion || "",
      users: [],
      funciones: [],
    },
  })

  // 2. Sincronizar formValues cuando lleguen asincrónicamente (ej: edit)
  useEffect(() => {
    const users = Array.isArray(formValues?.users)
      ? formValues.users.map((u: any) => (typeof u === "string" ? u : u?.value ?? u))
      : []

    const funciones = Array.isArray(formValues?.funciones)
      ? formValues.funciones.map((f: any) => (typeof f === "string" ? f : f?.value ?? f))
      : []

    form.reset({
      nombre: formValues?.nombre || "",
      descripcion: formValues?.descripcion || "",
      users,
      funciones,
    })
  }, [formValues, form])

  // 3. Definir el handler de submit
  function onSubmit(values: FormValues) {
    const formData: RolModel = {
      nombre: values.nombre,
      descripcion: values.descripcion,
      users: values.users,
      funciones: values.funciones,
    }

    onSubmitForm(formData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del rol</FormLabel>
                      <FormControl>
                        <Input placeholder="Escriba el nombre del rol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="users"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuarios</FormLabel>
                      <FormControl>
                        <ComboBox
                          id="usuarios"
                          value={field.value as any}
                          setValue={field.onChange}
                          options={selectUsuarios}
                          width={"100%"}
                          helperText={"Usuarios del rol"}
                          multiple={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Descripción del rol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="funciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Funciones</FormLabel>
                      <FormControl>
                        <ComboBox
                          id="funciones"
                          value={field.value as any}
                          setValue={field.onChange}
                          options={selectFunciones}
                          width={"100%"}
                          helperText={"Funciones del rol"}
                          multiple={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {children}
      </form>
    </Form>
  )
}