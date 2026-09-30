import {setCookie, deleteCookie, getCookie, CookieValueTypes} from 'cookies-next';

interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none' | boolean;
}

// ponytail: secure sigue el protocolo REAL (window.location), no NODE_ENV.
// Con NODE_ENV=production sobre HTTP el browser rechaza la cookie entera.
// Una vez sirvas HTTPS de verdad, vuelve a `true` fijo.
const options: CookieOptions = {
  maxAge: 86400,
  expires: new Date(Date.now() + 86400 * 1000),
  httpOnly: false,
  secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
  path: '/',
  sameSite: 'strict',
};

export const addCookie = (cookieName: string, dato: string): void => {
    setCookie(cookieName, dato, options);
}

export const removeCookie = (cookieName: string): void => {
    deleteCookie(cookieName);
}

export const getObjCookie = (nameObj: string): CookieValueTypes => {
    // @ts-expect-error - cookies-next types mismatch
    return getCookie(nameObj, options);
}
