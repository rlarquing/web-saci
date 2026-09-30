import {GenericRepository} from "./generic.repository";
import {menus} from "../../app/admin/menus/routers/menu.router";

export class MenuEntity {
    id: number;
    label: string;
    icon: string;
    to: string;
    menus: any[];
    tipo: string;
    menuPadre: string;


    constructor(id?: number, label?: string, icon?: string, to?: string, menus?: any[], tipo?: string, menuPadre?: string) {
        this.id = id || 0;
        this.label = label || '';
        this.icon = icon || '';
        this.to = to || '';
        this.menus = menus || [];
        this.tipo = tipo || '';
        this.menuPadre = menuPadre || '' ;
    }
}

export class MenuRepository extends GenericRepository<MenuEntity> {
    constructor() {
        super('menu');
    }
}