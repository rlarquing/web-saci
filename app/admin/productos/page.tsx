"use client";
import dynamic from "next/dynamic";
import {IconBtnDelete} from "@/components/icon-btn-delete.component";
import {SearchInput} from "@/components/search-input.component";
import {deleteMultiple, findAll, search, fotoUrl} from "./services/producto.service";
import Link from "next/link";
import {useEffect, useState} from "react";
import {productos} from "./routers/producto.router";
import {Button} from "@/components/ui/button";
import {Edit, Eye, Plus} from "lucide-react";
import {createColumns} from "@/components/DataTable/data-table.component";

const DataTable = dynamic(
  () => import("@/components/DataTable/data-table.component").then(mod => mod.DataTable),
  { ssr: false, loading: () => <div>Cargando...</div> }
);

export default function Index() {
    const [data, setData] = useState<any>({});
    const [selectionModel, setSelectionModel] = useState<any[]>([]);
    const disabled = selectionModel.length === 0;
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [buscar, setBuscar] = useState('');

    useEffect(() => {
        (async (): Promise<void> => {
            if (buscar !== '') setData(await search(buscar, paginationModel.pageSize, paginationModel.page + 1));
            else setData(await findAll(paginationModel.pageSize, paginationModel.page + 1));
        })();
    }, [paginationModel]);

    const borrarFilas = async (): Promise<void> => {
        await deleteMultiple(selectionModel);
        setSelectionModel([]);
        if (buscar !== '') setData(await search(buscar, paginationModel.pageSize, paginationModel.page + 1));
        else setData(await findAll(paginationModel.pageSize, paginationModel.page + 1));
    };

    const handleSearch = (valor: string): void => {
        setBuscar(valor);
        // La búsqueda real la dispara el efecto cuando cambia buscar junto con la paginación
        (async (): Promise<void> => {
            if (valor !== '') setData(await search(valor, paginationModel.pageSize, paginationModel.page + 1));
            else setData(await findAll(paginationModel.pageSize, paginationModel.page + 1));
        })();
    };

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
        field: 'action', headerName: 'Acciones', flex: 1,
        renderCell: (row: any) => (
            <div className="flex items-center gap-1">
                <Link href={`${productos.show.replace('[id]', row.id)}`}>
                    <Button variant="ghost" size="icon" title="Ver timeline"><Eye className="h-4 w-4" /></Button>
                </Link>
                <Link href={`${productos.edit.replace('[id]', row.id)}`}>
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                </Link>
            </div>
        )
    };

    // Columnas explícitas: primera la miniatura de la foto (endpoint público del API),
    // luego las del listado y por último las acciones (el columns prop reemplaza
    // las autogeneradas del DataTable, así que hay que incluirlas a mano).
    const columns = [
        {
            accessorKey: 'foto',
            header: 'Foto',
            enableSorting: false,
            cell: ({ row }: { row: any }) => {
                const p = row.original;
                const tiene = p.hasFoto === 'Si' || p.hasFoto === true;
                return tiene ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={fotoUrl(p.id)}
                        alt={`Foto de ${p.nombre ?? p.codigo}`}
                        className="h-10 w-10 rounded-lg border object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted text-[10px] text-muted-foreground">
                        —
                    </div>
                );
            },
        },
        ...createColumns(
            ['codigo', 'nombre', 'categoriaNombre', 'unidadNombre', 'stockMinimo', 'stockSeguridad'],
            ['Código', 'Nombre', 'Categoría', 'Unidad', 'Stock mínimo', 'Stock seguridad'],
        ),
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }: { row: any }) => actions.renderCell(row.original),
        },
    ];

    return <DataTable title={'Productos del inventario'} data={data} columns={columns as any}
        toolBar={dataTableToolBar} onSelectionModelChange={setSelectionModel} selectionModel={selectionModel}
        paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
        headerBackground='#f3f0f2' headerColor='#0f766e' />;
}
