import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useStoreContext } from "../contexts/store.context";
import { Save } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "./confirm-dialog.component";

interface BtnActiveProps {
    handleOk: () => any,
}
export function BtnActive({ handleOk }: BtnActiveProps) {
    const { store, setStore }: any = useStoreContext();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const handleConfirm = async () => {
        const data = await handleOk();
        setStore({ ...store, messageModel: data && data.messageModel ? data.messageModel : 'Elemento(s) activado(s) correctamente!' });
        if (data && data.ruta) {
            router.push(data.ruta);
        } else {
            router.refresh();
        }
        setOpen(false);
    };

    return (
        <>
            <Button onClick={() => setOpen(true)} variant="default" className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" />
                Activar
            </Button>
            <ConfirmDialog
                open={open}
                onOpenChange={setOpen}
                title="¿Está seguro que quiere realizar esta acción?"
                onConfirm={handleConfirm}
                confirmText="Aceptar"
                cancelText="Cancelar"
            />
        </>
    );
}
