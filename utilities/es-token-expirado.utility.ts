import jwt from 'jsonwebtoken';

/** Margen para no enviar un token que caduca mientras la petición viaja. */
const MARGEN_SEGUNDOS = 30;

export const esTokenExpirado = (token: string): boolean => {
    const decodedToken: any = jwt.decode(token, { complete: true });
    if (!decodedToken?.payload?.exp) return false;

    const ahoraEnSegundos = Date.now() / 1000;
    return decodedToken.payload.exp < ahoraEnSegundos + MARGEN_SEGUNDOS;
};
