import { AuthCredentials } from "../models";
import { auth } from '../endpoints/auth.endpoint';
import { removeCookie, addCookie, post } from "@/utilities";
import { MessageAdapter } from "@/adapters";

export const signIn = async (authCredentials: AuthCredentials): Promise<any> => {
    removeCookie('userLogged');
    removeCookie('menus');
    const data: any = await post(auth.login, false, null, authCredentials);
    if (data.msg.type === "error") {
        console.log(data.msg);
        return MessageAdapter(data.msg);
    }
    const userLogged = {
        token: data.obj.accessToken,
        refreshToken: data.obj.refreshToken,
        userId: data.obj.userId,
        userName: data.obj.userName,
        almacenId: data.obj.almacenId,
        almacenNombre: data.obj.almacenNombre,
        almacenes: data.obj.almacenes || [], // SelectDto de almacenes del usuario
    }

    const rolesLabels = data.obj.roles?.map((r: any) => r.label) || [];
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('userRoles', JSON.stringify(rolesLabels));
    }
    // ponytail: los menús NO van en cookie (supera el límite de 4 KB y nunca se leen).
    // Se guardan en IndexedDB (MenuService) + localStorage 'menuData' desde page.tsx.
    if (data && data.obj && data.obj.menus && data.obj.menus.length > 0) {
        const datos: string = JSON.stringify(userLogged);
        addCookie('userLogged', datos);
        if (data.obj.almacenes && data.obj.almacenes.length > 0) {
            const almacenes: string = JSON.stringify(data.obj.almacenes);
            addCookie('userAlmacenes', almacenes);
        }
        if (data.obj.productos && data.obj.productos.length > 0) {
            const productos: string = JSON.stringify(data.obj.productos);
            addCookie('userProductos', productos);
        }
    }

    return { menu: data.obj.menus, roles: data.obj.roles, almacenId: data.obj.almacenId };
}

export const logOut = async (): Promise<any> => {
    const response = await post(auth.logout);
    removeCookie('userLogged');
    removeCookie('userAlmacenes');
    removeCookie('userProductos');
    removeCookie('menus');
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem('userRoles');
    }
    return MessageAdapter(response.msg);
}
