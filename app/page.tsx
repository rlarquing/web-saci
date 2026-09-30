"use client"
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from 'next/dynamic'
import { signIn } from "./auth/services/auth.service";
import { useState } from "react";
import { useUserContext } from "@/contexts";
import { MenuService } from "@/services/menu.service";
import { Logo } from "@/components/logo.component";
import dayjs from "dayjs";

const FormLogin = dynamic(() => import('./auth/components/form-login.component'));

export default function Signin() {
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user, setUser }: any = useUserContext();
    const router = useRouter();

    async function handleSubmit(data: { userName: string; password: string }) {
        if (errorMsg) setErrorMsg('')
        setIsLoading(true);
        
        const body = {
            userName: data.userName,
            password: data.password,
        }
        
        try {
            const response = await signIn(body);
            if (response && response.menu && response.menu.length > 0) {
                const menu: MenuService = new MenuService();
                await menu.deleteAll();
                await menu.createAll(response.menu);
                // Guardar menús crudos en localStorage para poder refrescar sin reloguear
                window.localStorage.setItem('menuData', JSON.stringify(response.menu));
                const user: any = { username: body.userName, isAutenticated: true, roles: response.roles };
                setUser(user);
                window.localStorage.setItem('user', JSON.stringify(user));
                if (user.isAutenticated) {
                    router.push('/admin');
                }
            } else {
                setErrorMsg('Usuario sin permisos asignados.');
            }
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    }
    
    const anno = dayjs(new Date()).year();
    
    return (
        <main className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-[#faf8f6] via-[#f8f4f2] to-[#fedacf]/30">
            {/* Sección izquierda - Branding e Imagen (oculta en móvil) */}
            <section className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-8 relative overflow-hidden">
                {/* Fondo con overlay */}
                <div className="absolute inset-0 z-0">
                    <Image 
                        alt="Ambiente de estacionamiento moderno" 
                        src="/images/login/fondo.png"
                        fill
                        className="object-cover opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f766e]/5 to-transparent" />
                </div>
                
                {/* Logo y nombre */}
                <div className="relative z-10">
                    <Logo size="lg" showText variant="light" imageBg="white" />
                </div>
                
                {/* Contenido central - Beneficios */}
                <div className="relative z-10 flex-1 flex items-center justify-center">
                    <div className="max-w-md text-center lg:text-left">
                        <h2 className="text-3xl xl:text-4xl font-bold text-gray-800 mb-4">
                            Gestiona tus almacenes de forma <span className="text-[#0f766e]">inteligente</span>
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Control total, reportes en tiempo real y administración simplificada en una sola plataforma.
                        </p>
                    </div>
                </div>
                
                {/* Footer izquierdo */}
                <div className="relative z-10 text-gray-500 text-sm">
                    © {anno} SACI - Todos los derechos reservados
                </div>
            </section>
            
            {/* Sección derecha - Formulario */}
            <section className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12 bg-white lg:bg-transparent">
                <div className="w-full max-w-md">
                    {/* Logo móvil */}
                    <div className="lg:hidden flex items-center justify-center mb-8">
                        <Logo size="md" showText variant="light" imageBg="white" />
                    </div>
                    
                    {/* Card del formulario */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 lg:p-10 border border-gray-100">
                        <FormLogin 
                            errorMessage={errorMsg} 
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                        />
                    </div>
                    
                    {/* Footer móvil */}
                    <div className="lg:hidden text-center mt-8 text-gray-500 text-sm">
                        © {anno} SACI - Todos los derechos reservados
                    </div>
                </div>
            </section>
        </main>
    )
}
