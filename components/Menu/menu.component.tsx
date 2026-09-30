"use client";
import React, { useEffect, useState } from "react";
import { MenuRepository } from "@/localdb/entity";
import { SubMenu } from "./sub-menu.component";
import { cn } from "@/lib/utils";

interface MenuProps {
    tipo: string;
    opened?: boolean;
    onToggleMenu?: () => void;
}

interface MenuItem {
    label: string;
    icon?: string;
    to?: string;
    tipo: string;
    childrens: any[];
}

export function Menu({ tipo, opened = true, onToggleMenu }: MenuProps) {
    const [data, setData] = useState<MenuItem[]>([]);

    const loadMenu = React.useCallback(async () => {
        const menuRepository = new MenuRepository();
        const all_menus = await menuRepository.getAll();
        let menu: MenuItem[] = [];
        
        for (const element of all_menus) {
            let me: MenuItem | undefined;
            
            if (element.menuPadre === "") {
                // Menú principal - usar el icono directamente
                me = {
                    label: element.label,
                    icon: element.icon,
                    to: element.to,
                    tipo: element.tipo,
                    childrens: []
                };
            } else {
                // Submenú - buscar o crear el padre
                let found = menu.find(elem => elem.label === element.menuPadre);
                
                if (found) {
                    found.childrens.push({
                        label: element.label,
                        icon: element.icon,
                        to: element.to,
                        tipo: element.tipo,
                    });
                } else {
                    // Crear padre nuevo - usar icon del menuPadre si viene del API
                    me = {
                        label: element.menuPadre,
                        icon: element.padre?.icon || element.icon,
                        to: element.menu?.to || "",
                        tipo: element.tipo,
                        childrens: [{
                            label: element.label,
                            icon: element.icon,
                            to: element.to,
                            tipo: element.tipo,
                        }]
                    };
                }
            }
            
            if (me && me.tipo === tipo) {
                menu.push(me);
            }
        }
        
        // Ordenar padres alfabéticamente
        menu.sort((a, b) => a.label.localeCompare(b.label));
        // Ordenar hijos alfabéticamente dentro de cada padre
        menu.forEach(item => item.childrens.sort((a, b) => a.label.localeCompare(b.label)));
        
        setData(menu);
    }, [tipo]);

    useEffect(() => {
        loadMenu();
    }, [loadMenu]);

    // Escuchar evento de refresco desde dropdown-menu
    useEffect(() => {
        const handler = () => loadMenu();
        window.addEventListener('menuRefresh', handler);
        return () => window.removeEventListener('menuRefresh', handler);
    }, [loadMenu]);

    return (
        <nav className={cn("py-3", opened ? "px-2" : "px-1")}>
            {data && Array.isArray(data) && data.map((item: any, index: number) => (
                <SubMenu key={index} menu={item} submenus={item.childrens} opened={opened} onToggleMenu={onToggleMenu} />
            ))}
        </nav>
    );
}