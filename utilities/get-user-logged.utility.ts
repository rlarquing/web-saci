import { getObjCookie } from "./auth-cookies.utility";

export interface SelectDto {
    value: string;
    label: string;
}

export interface UserLogged {
    token: string;
    refreshToken: string;
    userId?: string;
    userName?: string;
    almacenId?: string; // Mantener por compatibilidad
    almacenIds?: string[]; // Array de almacenes asignados
    almacenNombre?: string;
    almacenes?: SelectDto[]; // SelectDto de almacenes del usuario (value=id, label=nombre)
    productos?: SelectDto[]; // SelectDto de tipos de medio del usuario
    roles?: string[];
}

/**
 * Obtiene la información del usuario logueado desde las cookies
 */
export const getUserLogged = (): UserLogged | null => {
    try {
        const userLoggedStr = getObjCookie('userLogged');
        if (userLoggedStr && typeof userLoggedStr === 'string') {
            return JSON.parse(userLoggedStr);
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Obtiene el almacenId del usuario logueado
 * Si el usuario tiene múltiples almacenes, retorna el primero
 */
export const getAlmacenId = (): string | null => {
    const user = getUserLogged();
    // Preferir almacenIds (array), si no existe usar almacenId (string legacy)
    if (user?.almacenIds && user.almacenIds.length > 0) {
        return user.almacenIds[0];
    }
    return user?.almacenId || null;
}

/**
 * Obtiene todos los almacenIds del usuario logueado
 */
export const getAlmacenIds = (): string[] => {
    const user = getUserLogged();
    // Si tiene almacenIds (array), retornarlo
    if (user?.almacenIds && user.almacenIds.length > 0) {
        return user.almacenIds;
    }
    // Si tiene almacenes (SelectDto array), extraer los values
    if (user?.almacenes && user.almacenes.length > 0) {
        return user.almacenes.map(p => p.value);
    }
    // Si solo tiene almacenId (string legacy), convertir a array
    if (user?.almacenId) {
        return [user.almacenId];
    }
    return [];
}

/**
 * Obtiene los almacenes del usuario desde la cookie userAlmacenes
 * Fallback: busca en userLogged.almacenes
 */
export const getUserAlmacenes = (): SelectDto[] => {
    try {
        const almacenesStr = getObjCookie('userAlmacenes');
        if (almacenesStr && typeof almacenesStr === 'string') {
            return JSON.parse(almacenesStr);
        }
    } catch { }
    const user = getUserLogged();
    if (user?.almacenes && user.almacenes.length > 0) {
        return user.almacenes;
    }
    return [];
}

/**
 * Obtiene los tipos de medio del usuario desde la cookie userProductos
 * Fallback: busca en userLogged.productos
 */
export const getUserProductos = (): SelectDto[] => {
    try {
        const productosStr = getObjCookie('userProductos');
        if (productosStr && typeof productosStr === 'string') {
            return JSON.parse(productosStr);
        }
    } catch { }
    const user = getUserLogged();
    if (user?.productos && user.productos.length > 0) {
        return user.productos;
    }
    return [];
}

/**
 * Obtiene el token del usuario logueado
 */
export const getToken = (): string | null => {
    const user = getUserLogged();
    return user?.token || null;
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export const hasRole = (role: string): boolean => {
    const rolesStr = typeof window !== 'undefined' ? window.localStorage.getItem('userRoles') : null;
    if (rolesStr) {
        try {
            const roles: string[] = JSON.parse(rolesStr);
            return roles.includes(role);
        } catch {}
    }
    const user = getUserLogged();
    return user?.roles?.includes(role) || false;
}

/**
 * Verifica si el usuario es administrador
 */
export const isAdmin = (): boolean => {
    return hasRole('ADMINISTRADOR');
}
