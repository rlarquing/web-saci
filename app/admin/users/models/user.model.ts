
export interface UserModel{
    userName: string;
    password?: string;
    confirmPassword?: string;
    email?: string;
    roles: string[];
    funciones?: string[];
    almacenes?: string[];
}
