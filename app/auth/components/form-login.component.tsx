"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Loader2, Eye, EyeOff, User, KeyRound } from "lucide-react"
import { useState } from "react"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface FormLoginProps {
  errorMessage: string
  onSubmit: (data: { userName: string; password: string }) => void
  isLoading?: boolean
}

// Schema de validación con Zod
const formSchema = z.object({
  userName: z.string().min(2, "Mínimo 2 caracteres"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

type FormValues = z.infer<typeof formSchema>

const FormLogin = ({ errorMessage, onSubmit, isLoading = false }: FormLoginProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // 1. Definir el formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  })

  // 2. Definir el handler de submit
  function handleSubmit(values: FormValues) {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header del formulario */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0f766e] to-[#115e59] mb-4 shadow-lg shadow-[#0f766e]/30 transform transition-transform hover:scale-105">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Bienvenido</h1>
          <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Campos del formulario */}
        <div className="space-y-5">
          {/* Campo Usuario */}
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={`text-sm font-medium transition-colors ${
                    focusedField === "userName" ? "text-[#0f766e]" : "text-gray-700"
                  }`}
                >
                  Usuario
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User
                        className={`w-5 h-5 transition-colors ${
                          focusedField === "userName" ? "text-[#0f766e]" : ""
                        }`}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="Ingrese su usuario"
                      disabled={isLoading}
                      onFocus={() => setFocusedField("userName")}
                      className="w-full h-12 pl-11 bg-gray-50/50 border-gray-200 rounded-xl
                                 focus:bg-white focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]
                                 transition-all duration-200 placeholder:text-gray-400"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Contraseña */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={`text-sm font-medium transition-colors ${
                    focusedField === "password" ? "text-[#0f766e]" : "text-gray-700"
                  }`}
                >
                  Contraseña
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <KeyRound
                        className={`w-5 h-5 transition-colors ${
                          focusedField === "password" ? "text-[#0f766e]" : ""
                        }`}
                      />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese su contraseña"
                      disabled={isLoading}
                      onFocus={() => setFocusedField("password")}
                      className="w-full h-12 pl-11 pr-11 bg-gray-50/50 border-gray-200 rounded-xl
                                 focus:bg-white focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]
                                 transition-all duration-200 placeholder:text-gray-400"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Botón de envío */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-[#0f766e] to-[#115e59]
                     hover:from-[#a12025] hover:to-[#7b1a1d]
                     text-white font-semibold rounded-xl
                     transition-all duration-300
                     hover:shadow-lg hover:shadow-[#0f766e]/25
                     disabled:opacity-70 disabled:cursor-not-allowed
                     transform active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Verificando...
            </span>
          ) : (
            "Iniciar Sesión"
          )}
        </Button>

        {/* Mensaje de error del servidor */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 animate-in fade-in-0 slide-in-from-top-2 duration-300">
            <p className="text-sm text-red-600 text-center font-medium">{errorMessage}</p>
          </div>
        )}
      </form>
    </Form>
  )
}

export default FormLogin