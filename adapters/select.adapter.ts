import { SelectOption} from "@/models";

export const SelectAdapter = (obj: any): SelectOption => ({
        label: obj.label ?? obj.nombre ?? '',
        value: obj.value ?? obj.id ?? '',
});
