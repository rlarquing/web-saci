"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { subirFoto, fotoUrl } from "../services/producto.service";

interface FotoProductoProps {
    id: string;
    tieneFoto: boolean;
}

/** Límite razonable por petición (el API acepta hasta ~900 KB). */
const MAX_BASE64 = 850_000;

/**
 * Comprime una imagen en el cliente: reescala a máx. 512px por lado y
 * re-encodea a JPEG (calidad 0.72) sobre un canvas. Devuelve data URL.
 */
async function comprimirImagen(archivo: File): Promise<string> {
    const bitmap = await createImageBitmap(archivo);
    const ladoMax = 512;
    const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height));
    const ancho = Math.max(1, Math.round(bitmap.width * escala));
    const alto = Math.max(1, Math.round(bitmap.height * escala));

    const canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas no disponible");
    ctx.drawImage(bitmap, 0, 0, ancho, alto);
    bitmap.close?.();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
    if (dataUrl.length > MAX_BASE64) {
        // Segunda pasada más agresiva si aún supera el límite
        return canvas.toDataURL("image/jpeg", 0.5);
    }
    return dataUrl;
}

/**
 * Carga y previsualización de la foto del producto en la ficha de edición.
 * La imagen se sirve del endpoint público /producto-foto/:id del API.
 */
export function FotoProducto({ id, tieneFoto }: FotoProductoProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [subiendo, setSubiendo] = useState(false);
    const [version, setVersion] = useState(0);
    const [error, setError] = useState(false);

    const onSelect = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const archivo = e.target.files?.[0];
        e.target.value = "";
        if (!archivo) return;
        if (!archivo.type.startsWith("image/")) {
            toast.error("Selecciona un fichero de imagen");
            return;
        }
        setSubiendo(true);
        try {
            const dataUrl = await comprimirImagen(archivo);
            const resp = await subirFoto(id, dataUrl);
            if (resp.type === "success") {
                toast.success(resp.message || "Foto actualizada");
                setError(false);
                setVersion((v) => v + 1);
            } else {
                toast.error(resp.message || "No se pudo subir la foto");
            }
        } catch (err: any) {
            toast.error(err?.message || "Error al procesar la imagen");
        } finally {
            setSubiendo(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-xl border bg-muted">
                {tieneFoto && !error ? (
                    <Image
                        src={`${fotoUrl(id)}?v=${version}`}
                        alt="Foto del producto"
                        fill
                        unoptimized
                        className="object-cover"
                        onError={() => setError(true)}
                        sizes="96px"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        Sin foto
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onSelect}
                />
                <Button
                    type="button"
                    variant="outline"
                    disabled={subiendo}
                    onClick={() => inputRef.current?.click()}
                >
                    {subiendo ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                        <Camera className="mr-1 h-4 w-4" />
                    )}
                    {tieneFoto ? "Cambiar foto" : "Subir foto"}
                </Button>
                <p className="text-xs text-muted-foreground">
                    JPG/PNG · se redimensiona a 512px y se comprime automáticamente
                </p>
            </div>
        </div>
    );
}
