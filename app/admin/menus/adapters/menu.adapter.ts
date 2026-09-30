import {ReadMenu} from "../models";

export const MenuAdapter = (obj: any): ReadMenu => {
    const parent = obj.menu ?? obj.padre;
    return ({
    dtoToString: obj.dtoToString,
    id: obj.id,
    label: obj.label,
    icon: obj.icon,
    to: obj.to,
    menuPadre: obj.menuPadre,
    menu: parent === undefined ? undefined : (parent.id ?? parent.value),
    menus: obj.menus.map((item: any)=>({label:item.label, value:item.id})),
    tipo: obj.tipo
})};
