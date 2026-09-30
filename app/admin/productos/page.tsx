"use client";
import dynamic from "next/dynamic";
import {IconBtnDelete} from "@/components/icon-btn-delete.component";
import {SearchInput} from "@/components/search-input.component";
import {deleteMultiple, findAll, search} from "./services/producto.service";
import Link from "next/link";
import * as React from "react";
import {useEffect, useState} from "react";
import {productos} from "./routers/producto.router";
import {useStoreContext} from "@/contexts/store.context";
import {Button} from "@/components/ui/button";
import {Edit, Eye, Plus} from "lucide-react";

const DataTable = dynamic(
  () => import("@/components/DataTable/data-table.component").then(mod => mod.DataTable),
  { ssr: false, loading: () => <div>Cargando...</div> }
);

export default function Index() {
    const {store, setStore}: any = useStoreContext();
    const [data, setData] = useState<any>({});
    const [selectionModel, setSelectionModel] = useState<any[]>([]);
    const disabled = selectionModel.length === 0;
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [buscar, setBuscar] = useState('');

    useEffect(() => {
        (async (): Promise<void> => {
            if (buscar !== '') {
                setData(await search(buscar, paginationModel.pageSize, paginationModel.page + 1));
            } else {
                setData(await findAll(paginationModel.pageSize, paginationModel.page + 1));
            }
        })();
    }, [paginationModel]);

    const borrarFilas = async () => {
        const ids: string[] = selectionModel;
        const response: any = await deleteMultiple(ids);
        if (response.statusCode === 200) {
            setPaginationModel({ ...paginationModel, page: 0 });
            setSelectionModel([]);
        } else {
            setStore({ ...store, messageModel: response.message || 'Error al eliminar los productos' });
        }
        return response;
    }

    const handleSearch = async (value: string): Promise<void> => {
        setBuscar(value);
        setPaginationModel({ page: 0, pageSize: 10 });
        setData(await search(value, paginationModel.pageSize, paginationModel.page + 1));
    }

    const dataTableToolBar = (
        <div className="flex items-center gap-2">
            <IconBtnDelete handleOk={borrarFilas} disabled={disabled}/>
            <Link href={productos.new}>
                <Button variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
            </Link>
            <SearchInput id={'buscar'} placeholder={'Buscar producto'} buscar={handleSearch}/>
        </div>
    );

    const actions: any = {
        field: 'action',
        headerName: 'Acciones',
        flex: 1,
        renderCell: (row: any) => (
            <div className="flex gap-1">
                <Link href={`${productos.edit.replace('[id]', row.id)}`}>
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                </Link>
            </div>
        )
    };

    return (
        <div>
            <DataTable
                title={'Productos del inventario'}
                data={data}
                actions={actions}
                toolBar={dataTableToolBar}
                onSelectionModelChange={setSelectionModel}
                selectionModel={selectionModel}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                headerBackground='#f3f0f2'
                headerColor='#0f766e'
            />
        </div>
    )
}
