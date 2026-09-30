'use client';
import React, { useEffect, useState } from 'react';
import { Menu } from "@/components/Menu/menu.component";
import { Separator } from "@/components/ui/separator";
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from "@/components/logo.component";
import dayjs from "dayjs";
import {
    Menu as MenuIcon,
    Loader2
} from "lucide-react";
import { AccessDenied } from '@/components/access-denied.component';
import { socketService } from '@/services/socket.service';
import { getToken } from '@/utilities/get-user-logged.utility';

const DRAWER_WIDTH = 270;
const DRAWER_WIDTH_CLOSED = 72;

const DropdownMenu = dynamic(() => import('../../../components/Menu/dropdown-menu.component'));

interface Props {
    children: React.ReactNode;
    title: string;
}

export function Template({ children, title }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(true);

    const toggleDrawer = () => setOpen(!open);
    const anno = dayjs(new Date()).year();

    useEffect(() => {
        // Verificar acceso basado en menús del usuario
        const checkAccess = async () => {
            const userStr = window.localStorage.getItem('user');
            if (!userStr) {
                router.push('/');
                return;
            }

            const user = JSON.parse(userStr);

            // Importar el repositorio de menú dinámicamente para evitar problemas de SSR
            const { MenuRepository } = await import('../../../localdb/entity');
            const menuRepository = new MenuRepository();
            const menus = await menuRepository.getAll();

            // Normalizar la ruta actual (quitar trailing slash, convertir [id] a params)
            let normalizedPath = pathname;
            if (normalizedPath.endsWith('/') && normalizedPath.length > 1) {
                normalizedPath = normalizedPath.slice(0, -1);
            }

            // Verificar si la ruta actual está en los menús del usuario
            const hasAccess = menus.some((menu: any) => {
                const menuTo = menu.to.replace('/[id]', '').replace('/[name]', '');
                return normalizedPath.startsWith(menuTo) || normalizedPath === menu.to;
            });

            // Si el usuario no tiene acceso a esta ruta, denegar
            if (!hasAccess && normalizedPath !== '/admin') {
                setHasAccess(false);
                setLoading(false);
                return;
            }

            setHasAccess(true);
            setLoading(false);
        };

        checkAccess();
    }, [router, pathname]);

    useEffect(() => {
        const token = getToken();
        if (!token) return;

        socketService.connect(token);

        const unsubscribe = socketService.onMenuChange(async (data) => {
            console.log('[Template] Recibido menu:change — refrescando menús:', data);
            try {
                const { get } = await import('@/utilities/get.utility');
                const result = await get('auth/mis-menus', true);
                if (result?.obj && Array.isArray(result.obj) && result.obj.length > 0) {
                    const { MenuRepository } = await import('../../../localdb/entity');
                    const { MenuService } = await import('@/services/menu.service');
                    const menuService = new MenuService();
                    await menuService.deleteAll();
                    await menuService.createAll(result.obj);
                    window.localStorage.setItem('menuData', JSON.stringify(result.obj));
                    window.dispatchEvent(new CustomEvent('menuRefresh'));
                }
            } catch (error) {
                console.error('[Template] Error al refrescar menú por socket:', error);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <AccessDenied
                message="No tienes permisos para acceder a esta sección"
                showBackButton={false}
            />
        );
    }

    return (
        <div className="flex min-h-screen">
                {/* Banner superior - ocupa todo el ancho */}
                <header
                    className="fixed top-0 left-0 right-0 h-[70px] flex items-center px-4 sm:px-6 z-[60] bg-gradient-to-r from-[#0f766e] to-[#115e59] text-white shadow-lg shadow-black/20"
                >
                    <button
                        onClick={toggleDrawer}
                        className="mr-3 sm:mr-4 p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                        aria-label={open ? "Cerrar menú" : "Abrir menú"}
                    >
                        <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>

                    {/* Logo + Nombre */}
                    <div className="flex items-center gap-3 flex-grow">
                        <Logo size="md" showText variant="dark" />
                    </div>

                    <DropdownMenu iconColor="#1f2937" showAdminMenu={true} showDashboardMenu={false} />
                </header>

                <aside
                    className={`fixed left-0 bottom-0 border-r border-gray-800 transition-all duration-300 ease-in-out z-40 overflow-hidden flex flex-col bg-gradient-to-b from-gray-900 to-black text-white shadow-xl`}
                    style={{
                        width: open ? DRAWER_WIDTH : DRAWER_WIDTH_CLOSED,
                        top: '70px',
                        height: 'calc(100% - 70px)',
                    }}
                >
                    <Separator className="bg-gray-700/50" />
                    <div className="flex-1 overflow-auto">
                        <Menu tipo={'administracion'} opened={open} onToggleMenu={toggleDrawer} />
                    </div>
                </aside>

                <main
                    className={`flex-1 mt-[70px] p-3 sm:p-4 bg-gray-100 transition-all duration-300 ease-in-out min-h-screen`}
                    style={{ marginLeft: open ? DRAWER_WIDTH : DRAWER_WIDTH_CLOSED }}
                >
                    <div
                        className="bg-white rounded-xl p-4 sm:p-6 min-h-[650px] shadow-sm border border-gray-200/50 flex flex-col"
                    >
                        <div className="flex-1">
                            {children}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                            © {anno} SACI - Todos los derechos reservados
                        </div>
                    </div>
                </main>
            </div>
    );
}