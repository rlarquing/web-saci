import {getObjCookie} from "./auth-cookies.utility";

export const obtenerRefreshToken = async (): Promise<string> => {
    try {
        const userLogged: string = getObjCookie('userLogged') as string;
        if (!userLogged) return '';
        let userDetails = JSON.parse(userLogged);
        return userDetails.refreshToken || '';
    } catch {
        return '';
    }
}
