"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import * as React from "react";
import {useEffect, useState, use} from "react";
import {useStoreContext} from "@/contexts/store.context";
import {deleteMultiple, findAll, search} from "../services/nomenclator.service";
import {IconBtnDelete} from "@/components/icon-btn-delete.component";
import {SearchInput} from "@/components/search-input.component";
import {nomenclators} from "../routers/nomenclator.router";
import {Button} from "@/components/ui/button";
import {Edit, Plus} from "lucide-react";
import {MenuService} from "@/services/menu.service";

const DataTable = dynamic(
  () => import("@/components/DataTable/data-table.component").then(mod => mod.DataTable),
  { ssr: false, loading: () => <div>Cargando...</div> }
);

export default function Index({ params }: any) {
    const unwrappedParams: any = use(params);
    const name: string = unwrappedParams.name;
    const { store, setStore }: any = useStoreContext();
    const [displayName, setDisplayName] = useState<string>(name);
    const [data, setData] = useState<any>({});
    const [selectionModel, setSelectionModel] = useState<any[]>([]);
    // Estado derivado: no necesita useState ni efecto.
    const disabled = selectionModel.length === 0;
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [buscar, setBuscar] = useState('');

    // Effects
    useEffect(() => {
        (async (): Promise<void> => {
            // Obtener el nombre real del menú desde la DB local usando menu.value
            const menuService = new MenuService();
            const menuLabel = await menuService.getLabelByMenuValue(name);
            if (menuLabel) {
                setDisplayName(menuLabel);
            }
        })();
    }, [name]);

    useEffect(() => {
        (async (): Promise<void> => {
            if (buscar!==''){
                setData(await search(name, buscar, paginationModel.pageSize, paginationModel.page + 1));
            }else {
                setData(await findAll(name, paginationModel.pageSize, paginationModel.page + 1));
            }
        })();
    }, [paginationModel]);

    const onSelectionModelChange = (newSelectionModel: any[]) => {
        setSelectionModel(newSelectionModel)
    }

    const borrarFilas = async () => {
        const ids: string[] = selectionModel;
        const response: any = await deleteMultiple(name, ids);
        if (response.statusCode === 200) {
            setPaginationModel({ ...paginationModel, page: 0 });
            setSelectionModel([]);
        } else {
            setStore({ ...store, messageModel: response.message || 'Error al eliminar los elementos' });
        }
        return response;
    }

    const handleSearch = async (value: string): Promise<void> => {
        setBuscar(value);
        setPaginationModel({
            page: 0,
            pageSize: 10,
        })
        setData(await search(name, value, 10, 1));
    }

    const dataTableToolBar = (
            <div className="flex items-center gap-2">
                <IconBtnDelete handleOk={borrarFilas} disabled={disabled}/>
                <Link href={nomenclators.new.replace('[name]', name)}>
                    <Button variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                    </Button>
                </Link>
                <SearchInput id={'buscar'} placeholder={'Buscar'} buscar={handleSearch}/>
            </div>
    );

    const actions: any = {
        field: 'action',
        headerName: 'Acciones',
        flex: 1,
        renderCell: (row: any) => (
            <div className="flex gap-1">
                <Link href={`${nomenclators.edit.replace('[name]', name).replace('[id]', row.id)}`}>
                    <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        )
    };

    return (
        <div>
            <DataTable 
                title={`Listado de los ${displayName}`}
                data={data} 
                actions={actions} 
                toolBar={dataTableToolBar}
                onSelectionModelChange={onSelectionModelChange} 
                selectionModel={selectionModel}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                headerBackground='#f3f0f2' 
                headerColor='#0f766e'
            />
        </div>
    )
}