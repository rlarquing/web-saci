"use client";

import React, { createElement } from "react";
import { Folder } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import type { IconName } from "lucide-react/dynamic";

/**
 * Resuelve iconos de lucide-react dinámicamente por nombre.
 * Usa DynamicIcon que carga los iconos por nombre en tiempo de ejecución.
 */

/**
 * Componente que renderiza un icono dinámicamente.
 * Soporta nombres de la BD (snake_case, PascalCase, etc).
 */
export function IconByName({ 
    name, 
    size = 24, 
    className,
    ...props 
}: { 
    name: string | null | undefined; 
    size?: number; 
    className?: string;
} & React.HTMLAttributes<any>) {
    if (!name) return <Folder size={size} className={className} {...props} />;
    
    // Normalizar el nombre a kebab-case (formato que espera DynamicIcon)
    const normalizedName = name
        .trim()
        .toLowerCase()
        .replace(/[-_\s]+(.)?/g, (_, c) => c ? `-${c}` : '')
        .replace(/^-+/, '') as IconName;
    
    return createElement(DynamicIcon, {
        name: normalizedName,
        size,
        className,
        ...props,
    });
}

export { DynamicIcon };
export default IconByName;