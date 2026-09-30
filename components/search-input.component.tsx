import * as React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import { useState } from "react";

interface SearchInputProps {
    id: string,
    placeholder: string,
    buscar: (value: string) => void,
}
export function SearchInput({ id, placeholder, buscar }: SearchInputProps) {
    const [value, setValue] = useState('');
    return (
        <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 border rounded-md bg-[#f7f7f7]">
            <Input
                id={id}
                placeholder={placeholder}
                value={value}
                onChange={(e: any) => setValue(e.target.value)}
                className="border-0 focus-visible:ring-0 bg-[#fafafa] border border-[#dadada] rounded-md py-1 px-2 shadow-[inset_0px_0px_3px_#c9c9c9] min-w-0 flex-1"
            />
            <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                title="Buscar" 
                onClick={() => buscar(value)}
                className="text-blue-600 hover:text-blue-700 h-8 w-8 shrink-0"
            >
                <Search className="h-4 w-4" />
            </Button>
            <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                title="Recargar" 
                onClick={() => {
                    setValue('');
                    buscar('');
                }}
                className="text-green-600 hover:text-green-700 h-8 w-8 shrink-0"
            >
                <RotateCcw className="h-4 w-4" />
            </Button>
        </div>
    );
}
