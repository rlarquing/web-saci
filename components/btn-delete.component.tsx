import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useStoreContext } from "../contexts/store.context";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog.component";

interface BtnDeleteProps {
    handleOk: () => any,
}
export function BtnDelete({ handleOk }: BtnDeleteProps) {
    const { store, setStore }: any = useStoreContext();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const handleConfirm = async () => {
        const data = await handleOk();
        const msg = data?.messageModel?.message ?? data?.message ?? 'Elemento(s) eliminado(s) correctamente!';
        const statusCode = data?.statusCode ?? data?.messageModel?.statusCode;
        if (statusCode === 200 || statusCode === undefined) {
            toast.success(msg);
        } else {
            toast.error(msg);
        }
        setStore({ ...store, messageModel: msg });
        if (data?.ruta) {
            router.push(data.ruta);
        } else {
            router.refresh();
        }
        setOpen(false);
    };

    return (
        <>
            <Button onClick={() => setOpen(true)} variant="default" className="bg-yellow-600 hover:bg-yellow-700">
                <Trash2 className="mr-2 h-4 w-4" />
                Borrar
            </Button>
            <ConfirmDialog
                open={open}
                onOpenChange={setOpen}
                title="¿Está seguro que quiere realizar esta acción?"
                description="¡No se revertiran los cambios!"
                onConfirm={handleConfirm}
                confirmText="Aceptar"
                cancelText="Cancelar"
                destructive
            />
        </>
    );
}
