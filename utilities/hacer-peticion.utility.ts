import { obtenerToken } from "./obtener-token.utility";
import { api } from "./api.utility";
import { addCookie, removeCookie, getObjCookie } from "./auth-cookies.utility";
import { obtenerRefreshToken } from "./obtener-refresh-token.utility";
import { auth } from "../app/auth/endpoints/auth.endpoint";
import { esTokenExpirado } from "./es-token-expirado.utility";

function redirigirAlLogin(): void {
    if (typeof window !== 'undefined') {
        // Recarga completa a propósito: la sesión expiró y hay que descartar
        // todo el estado de cliente. useRouter() no es usable fuera de un componente.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/';
    }
}

function cerrarSesion(): void {
    removeCookie('userLogged');
    removeCookie('userAlmacenes');
    removeCookie('userProductos');
    removeCookie('menus');
    redirigirAlLogin();
}

/**
 * Refresco en vuelo. El API ROTA el refreshToken en cada llamada a
 * /auth/refresh-tokens: dos refrescos en paralelo se invalidan mutuamente y
 * dejan la cookie con un token ya muerto. Una pantalla que lanza varias
 * peticiones a la vez (el dashboard de BI, por ejemplo) reproducía eso siempre.
 */
let refrescoEnCurso: Promise<string | null> | null = null;

/**
 * Renueva los tokens una sola vez aunque varias peticiones caduquen a la vez.
 * Devuelve el nuevo accessToken, o null si la sesión ya no es recuperable.
 */
async function refrescarTokens(): Promise<string | null> {
    if (refrescoEnCurso) return refrescoEnCurso;

    refrescoEnCurso = (async (): Promise<string | null> => {
        try {
            const tokenActual: string = await obtenerToken();
            const refresh: string = await obtenerRefreshToken();
            if (!refresh) return null;

            const respuesta = await fetch(api() + auth.refresh, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // El access token va aunque esté vencido: la estrategia
                    // 'refresh' del API usa ignoreExpiration y solo necesita
                    // el userName del payload.
                    'Authorization': `Bearer ${tokenActual}`,
                },
                cache: 'no-store',
                body: JSON.stringify({ refreshToken: refresh }),
            });

            if (!respuesta.ok) return null;

            const datos = await respuesta.json();
            if (!datos?.accessToken) return null;

            // Preservar TODOS los datos del usuario, solo actualizar tokens
            const userLoggedStr = getObjCookie('userLogged');
            let userLogged: any = {};
            if (userLoggedStr && typeof userLoggedStr === 'string') {
                try {
                    userLogged = JSON.parse(userLoggedStr);
                } catch { }
            }
            userLogged.token = datos.accessToken;
            userLogged.refreshToken = datos.refreshToken;
            addCookie('userLogged', JSON.stringify(userLogged));

            return datos.accessToken;
        } catch (error) {
            console.error('Error al refrescar token:', error);
            return null;
        } finally {
            refrescoEnCurso = null;
        }
    })();

    return refrescoEnCurso;
}

export const hacerPeticion = async (url: string, metodo: string, necesitaToken: boolean = false, cuerpo: any = null, parametros: any = null, otrasOpciones?: any): Promise<any> => {
    let opciones: any = {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        mode: 'cors',
        ...otrasOpciones
    };

    let token: string = '';

    // ──────────────────────────────────────────────────
    // 1. REFRESH PREVENTIVO: verificar expiración ANTES de llamar al API
    // ──────────────────────────────────────────────────
    if (necesitaToken) {
        token = await obtenerToken();

        if (esTokenExpirado(token)) {
            const nuevoToken = await refrescarTokens();
            if (!nuevoToken) {
                // Refresh token también expiró → sesión inválida
                cerrarSesion();
                return null;
            }
            token = nuevoToken;
        }

        opciones.headers['Authorization'] = `Bearer ${token}`;
    }

    // ──────────────────────────────────────────────────
    // 2. PARÁMETROS QUERY STRING
    // ──────────────────────────────────────────────────
    if (cuerpo) {
        opciones.body = JSON.stringify(cuerpo);
    }

    if (parametros) {
        let urlObj = new URL(url);
        Object.keys(parametros).forEach(key => urlObj.searchParams.append(key, parametros[key]));
        url = urlObj.toString();
    }

    // ──────────────────────────────────────────────────
    // 3. LLAMADA REAL AL API + REINTENTO SI 401 (token expiró entre medio)
    // ──────────────────────────────────────────────────
    try {
        const respuesta = await fetch(url, opciones);

        // Si el servidor devuelve 401 token inválido, reintentar con refresh
        if (respuesta.status === 401 && necesitaToken) {
            // Otra petición pudo haber refrescado mientras esta estaba en vuelo:
            // reintentar con el token vigente antes de rotar otro refreshToken.
            const tokenVigente = await obtenerToken();
            const nuevoToken = tokenVigente && tokenVigente !== token
                ? tokenVigente
                : await refrescarTokens();

            if (!nuevoToken) {
                // Si el refresh también falló, sesión inválida
                cerrarSesion();
                return null;
            }

            opciones.headers['Authorization'] = `Bearer ${nuevoToken}`;
            const reintento = await fetch(url, opciones);
            return await reintento.json();
        }

        return await respuesta.json();
    } catch (error: any) {
        console.log(error);
        return null;
    }
}
