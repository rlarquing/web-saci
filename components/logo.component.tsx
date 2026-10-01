"use client";
import Image from "next/image";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    variant?: "light" | "dark";
    imageBg?: "white" | "transparent";
}

const sizeMap = {
    sm: "w-14 h-12",
    md: "w-20 h-16",
    lg: "w-24 h-20",
};

const textStyleMap = {
    light: {
        title: "text-[#0f766e]",
        subtitle: "text-[#115e59]",
    },
    dark: {
        title: "text-white",
        subtitle: "text-white/90",
    },
};

const imageBgMap = {
    white: "bg-white",
    transparent: "bg-transparent",
};

const textSizeMap = {
    sm: { title: "text-base", subtitle: "text-xs" },
    md: { title: "text-lg", subtitle: "text-sm" },
    lg: { title: "text-xl", subtitle: "text-base" },
};

export function Logo({ className = "", size = "md", showText = false, variant = "dark", imageBg = "white" }: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div
                className={`${sizeMap[size]} ${imageBgMap[imageBg]} rounded-2xl flex items-center justify-center overflow-hidden shadow-xl ${variant === 'light' ? 'shadow-[#0f766e]/20' : 'shadow-black/30'} border border-white/50 relative`}
            >
                <Image
                    src="/images/logo.png"
                    alt="Logo SACI"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 48px, 56px"
                    priority
                />
            </div>
            
            {showText && (
                <div>
                    <h1 className={`${textSizeMap[size].title} ${textStyleMap[variant].title} font-bold leading-tight`}>
                        Sistema Automatizado
                    </h1>
                    <p className={`${textSizeMap[size].subtitle} ${textStyleMap[variant].subtitle} font-medium`}>
                        de Control de Inventarios
                    </p>
                </div>
            )}
        </div>
    );
}
