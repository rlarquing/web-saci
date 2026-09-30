"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AccessDeniedProps {
    message?: string;
    showBackButton?: boolean;
}

export function AccessDenied({ 
    message = "No tienes acceso a esta sección", 
    showBackButton = true 
}: AccessDeniedProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
            <Card className="w-full max-w-md">
                <CardContent className="flex flex-col items-center pt-8 pb-8">
                    <div className="rounded-full bg-red-100 p-4 mb-4">
                        <Lock className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
                    <p className="text-muted-foreground text-center mb-6">{message}</p>
                    
                    <div className="flex gap-4">
                        {showBackButton && (
                            <Button variant="outline" onClick={() => router.back()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        )}
                        <Button onClick={() => router.push('/admin')}>
                            <Home className="mr-2 h-4 w-4" />
                            Ir al Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}