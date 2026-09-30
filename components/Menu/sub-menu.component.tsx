"use client";

import { useState } from "react";
import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import { IconByName } from "./icon-registry";

interface SubMenuProps {
    menu?: any,
    submenus: any[],
    opened?: boolean,
    onToggleMenu?: () => void
}

export function SubMenu({ menu, submenus, opened = true, onToggleMenu }: SubMenuProps) {
    const [isOpen, setIsOpen] = useState(true);
    const handleClick = () => {
        if (!opened && submenus && submenus.length > 0) {
            // Si el menú está cerrado y tiene hijos, abrir el drawer
            onToggleMenu?.();
        } else {
            setIsOpen(!isOpen);
        }
    };

    return menu ?
        submenus && submenus.length > 0 ?
            (
                <div className="mb-1">
                    <button 
                        onClick={handleClick}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg text-gray-200 hover:bg-white/10 hover:text-white transition-all duration-200",
                            !opened && "justify-center cursor-pointer"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <IconByName name={menu.icon} size={20} className="flex-shrink-0 text-gray-300" />
                            {opened && <span>{menu.label}</span>}
                        </div>
                        {opened && (isOpen ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />)}
                    </button>
                    
                    {isOpen && opened && (
                        <div className="ml-4 mt-1 space-y-0.5 border-l border-gray-700 pl-2">
                            {submenus.map((item: any, index: number) => {
                                return (
                                    <Link 
                                        key={index}
                                        href={`${item.to}`}
                                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200"
                                    >
                                        <IconByName name={item.icon} size={16} className="flex-shrink-0" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            )
            :
            (
                <Link 
                    href={`${menu.to}`}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-200 hover:bg-white/10 hover:text-white transition-all duration-200 mb-1",
                        !opened && "justify-center"
                    )}
                >
                    <IconByName name={menu.icon} size={20} className="flex-shrink-0 text-gray-300" />
                    {opened && <span>{menu.label}</span>}
                </Link>
            )
        :
        (
            <></>
        )

}