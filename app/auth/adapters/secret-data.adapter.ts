export const SecretDataAdapter = (obj: any) => ({
    accessToken: obj.accessToken,
    refreshToken: obj.refreshToken,
    functions:  obj.functions,
    menus:  obj.menus
});