"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ComboBox } from "@/components/combo-box.component"
import { UserModel } from "../models"
import { createSelectRol } from "@/app/admin/roles/services/rol.service"
import { createSelectFuncion } from "@/app/admin/functions/services/function.service"
import { createSelect } from "@/app/admin/nomenclators/services/nomenclator.service"
import { MessageModel, SelectOption } from "@/models"
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

interface FormUserProps {
  children: any
  formValues?: Partial<UserModel>
  onSubmitForm: (data: UserModel) => void
}

// Schema de validación con Zod.
// La contraseña es obligatoria solo en creación: en modo edición los campos de contraseña
// no se muestran y quedan vacíos (el formulario no permite cambiarla), por lo que exigir
// min 6 bloquearía el submit de actualización sin mostrar ningún error.
const baseSchema = z.object({
  userName: z.string().min(2, "Mínimo 2 caracteres"),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  roles: z.array(z.string()).min(1, "Seleccione al menos un rol"),
  funciones: z.array(z.string()).optional(),
  almacenes: z.array(z.string()).optional(),
})

const createSchema = baseSchema.superRefine((data, ctx) => {
  if (!data.password || data.password.length < 6) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Mínimo 6 caracteres",
      path: ["password"],
    })
  }
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    })
  }
})

const editSchema = baseSchema.superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    })
  }
})

type FormValues = z.infer<typeof baseSchema>

async function getData(): Promise<{ rols: any[]; functions: any[]; almacenes: any[] }> {
  const rols = await createSelectRol()
  const functions = await createSelectFuncion()
  const almacenes = await createSelect("almacen")
  return { rols: Array.isArray(rols) ? rols : [], functions: Array.isArray(functions) ? functions : [], almacenes: Array.isArray(almacenes) ? almacenes : [] }
}

export default function FormUser({ children, formValues, onSubmitForm }: FormUserProps) {
  const [selectRoles, setSelectRoles] = useState<SelectOption[]>([])
  const [selectFunciones, setSelectFunciones] = useState<SelectOption[]>([])
  const [selectAlmacenes, setSelectAlmacenes] = useState<SelectOption[]>([])

  // Cargar datos para los ComboBox
  useEffect(() => {
    ;(async () => {
      const data = await getData()
      setSelectRoles(data.rols)
      setSelectFunciones(data.functions)
      setSelectAlmacenes(data.almacenes)
    })()
  }, [])

  // 1. Definir el formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formValues ? editSchema : createSchema),
    defaultValues: {
      userName: "",
      password: "",
      confirmPassword: "",
      email: "",
      roles: [],
      funciones: [],
      almacenes: [],
    },
  })

  // 2. Sincronizar formValues cuando lleguen asincrónicamente (ej: edit)
  useEffect(() => {
    const roles = Array.isArray(formValues?.roles)
      ? formValues.roles.map((r: any) => (typeof r === "string" ? r : r?.value ?? r))
      : []

    const funciones = Array.isArray(formValues?.funciones)
      ? formValues.funciones.map((f: any) => (typeof f === "string" ? f : f?.value ?? f))
      : []

    const almacenes = Array.isArray(formValues?.almacenes)
      ? formValues.almacenes.map((p: any) => (typeof p === "string" ? p : p?.value ?? p))
      : []

    form.reset({
      userName: formValues?.userName || "",
      email: formValues?.email || "",
      roles,
      funciones,
      almacenes,
    })
  }, [formValues, form])

  // 3. Definir el handler de submit
  function onSubmit(values: FormValues) {
    const formData: UserModel = {
      userName: values.userName,
      password: values.password,
      confirmPassword: values.confirmPassword,
      email: values.email || undefined,
      roles: values.roles,
      funciones: values.funciones || undefined,
      almacenes: values.almacenes || undefined,
    }

    // En modo edición, no enviada la contraseña
    if (formValues) {
      delete formData.password
      delete formData.confirmPassword
    }

    onSubmitForm(formData)
  }

  const isEditMode = !!formValues

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
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="Escriba el nombre del usuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                  {!isEditMode && ( <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Contraseña del usuario" {...field} />
                      </FormControl>
                      {!isEditMode && <FormMessage />}
                    </FormItem>
                  )}
                />
                )}

                <FormField
                  control={form.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roles del usuario</FormLabel>
                      <FormControl>
                        <ComboBox
                          id="roles"
                          value={field.value as any}
                          setValue={field.onChange}
                          options={selectRoles}
                          width={"100%"}
                          helperText={"Roles del usuario"}
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email del usuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isEditMode && (
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar contraseña</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirmación de la contraseña"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="almacenes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Almacenes</FormLabel>
                      <FormControl>
                        <ComboBox
                          id="almacenes"
                          value={field.value as any}
                          setValue={field.onChange}
                          options={selectAlmacenes}
                          width={"100%"}
                          helperText={"Almacenes que puede usar el usuario"}
                          multiple={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              {/* Funciones - toda la fila */}
              <div className="space-y-4 col-span-1 md:col-span-2">
                  <FormField
                      control={form.control}
                      name="funciones"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Funciones particulares</FormLabel>
                              <FormControl>
                                  <ComboBox
                                      id="funciones"
                                      value={field.value as any}
                                      setValue={field.onChange}
                                      options={selectFunciones}
                                      width={"100%"}
                                      helperText={"Funciones particulares del usuario"}
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