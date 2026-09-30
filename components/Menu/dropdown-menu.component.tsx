import * as React from 'react';
import { useRouter } from "next/navigation";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  Settings, 
  LogOut, 
  LayoutDashboard
} from "lucide-react";
import { logOut as logoutService } from '@/app/auth/services/auth.service';
import { isAdmin } from '@/utilities/get-user-logged.utility';
import { socketService } from '@/services/socket.service';

const get = (endpoint: string) => import('@/utilities/get.utility').then(m => m.get(endpoint, true));

function getUserInitials(username: string | null): string {
  if (!username || username.trim() === '') return 'A';
  const parts = username.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.substring(0, 2).toUpperCase();
}

export default function DropdownMenuComponent({ iconColor, showAdminMenu }: any) {
  const [open, setOpen] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const router = useRouter();
  
  // Obtener el usuario desde localStorage
  const userStr = typeof window !== 'undefined' ? window.localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const userInitials = getUserInitials(user?.username || null);

  async function refreshMenu() {
    setRefreshing(true);
    try {
      // Traer menús FRESCOS desde el API (no desde caché local)
      const response = await get('auth/mis-menus');

      if (response?.obj && Array.isArray(response.obj) && response.obj.length > 0) {
        const { MenuService } = await import('@/services/menu.service');
        const menuService = new MenuService();
        await menuService.deleteAll();
        await menuService.createAll(response.obj);

        // Actualizar localStorage con los datos frescos
        window.localStorage.setItem('menuData', JSON.stringify(response.obj));

        // Disparar evento para que Menu.component recargue
        window.dispatchEvent(new CustomEvent('menuRefresh'));
      } else {
        console.warn('No se obtuvieron menús del API');
      }

      // Avisar al servidor para que notifique a los demás usuarios conectados
      if (socketService.isConnected()) {
        socketService.emit('menu:refresh-request', {
          userId: user?.userId,
          timestamp: new Date().toISOString(),
        });
        console.log('[Dropdown] Solicitado refresh global vía socket');
      } else {
        console.warn('[Dropdown] Socket no conectado, el refresh solo es local');
      }
    } catch (error) {
      console.error('Error al refrescar menú:', error);
    } finally {
      setRefreshing(false);
    }
  }

  async function logout() {
    try {
      // Limpiar localStorage
      window.localStorage.removeItem('user');
      // Limpiar IndexedDB (menús)
      const { MenuRepository } = await import('@/localdb/entity');
      const menuRepo = new MenuRepository();
      await menuRepo.clear();
      // Llamar al servicio de logout (limpia cookies)
      await logoutService();
      router.push('/');
    } catch (error) {
      console.log(error);
      // Siempre redirigir aunque falle algo
      router.push('/');
    }
  }

  async function goAdministration() {
    await router.push('/admin');
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" className="rounded-full hover:scale-105 transition-transform duration-200 focus:ring-2 focus:ring-white/30" style={{ backgroundColor: 'white', color: iconColor }} />}
      >
      <span className="text-sm font-semibold">{userInitials}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border border-gray-200/50">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-sm font-semibold text-gray-700">Menú</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-gray-200" />
        {showAdminMenu && (
          <DropdownMenuItem onClick={goAdministration} className="cursor-pointer rounded-lg mx-1 my-0.5 hover:bg-gray-100 focus:bg-gray-100">
            <Settings className="mr-2 h-4 w-4 text-gray-600" />
            <span className="text-gray-700">Administración</span>
          </DropdownMenuItem>
        )}
        {isAdmin() && (
          <DropdownMenuItem onClick={refreshMenu} disabled={refreshing} className="cursor-pointer rounded-lg mx-1 my-0.5 hover:bg-gray-100 focus:bg-gray-100">
            <RefreshCw className={`mr-2 h-4 w-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-gray-700">{refreshing ? 'Refrescando...' : 'Refrescar menú'}</span>
          </DropdownMenuItem>
        )}
        {(showAdminMenu || isAdmin()) && <DropdownMenuSeparator className="bg-gray-200" />}
        <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-lg mx-1 my-0.5 hover:bg-red-50 focus:bg-red-50 text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Salir</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
