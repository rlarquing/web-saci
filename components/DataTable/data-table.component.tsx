"use client"

import * as React from "react";
import {formatFechaHumana} from "@/utilities/format-date.utility";
import {
    columnFilteringFeature,
    columnVisibilityFeature,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    filterFn_includesString,
    flexRender,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    tableFeatures,
    useTable,
    type ColumnDef,
    type ColumnFiltersState,
    type ColumnVisibilityState,
    type RowData,
    type RowSelectionState,
    type SortingState,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Inbox, SearchX, Download, SlidersHorizontal, FileSpreadsheet, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// TanStack Table v9: features y row models registrados explícitamente.
// Se registran los built-ins usados para conservar el comportamiento por
// defecto de v8 (filtro includesString, sort alphanumeric).
const dataTableFeatures = tableFeatures({
    columnVisibilityFeature,
    columnFilteringFeature,
    filterFns: { includesString: filterFn_includesString },
    filteredRowModel: createFilteredRowModel(),
    rowSortingFeature,
    sortFns: { alphanumeric: sortFn_alphanumeric },
    sortedRowModel: createSortedRowModel(),
    rowPaginationFeature,
    paginatedRowModel: createPaginatedRowModel(),
    rowSelectionFeature,
});

// Tipo de columna compartido con las páginas (v9 requiere TFeatures).
export type DataColumnDef<T extends RowData = any> = ColumnDef<typeof dataTableFeatures, T, any>;

// Tipo para el formato de datos del API (formato anterior)
interface ApiDataFormat {
    data?: {
        items: any[];
        meta?: {
            totalItems: number;
            itemCount: number;
            itemsPerPage: number;
            totalPages: number;
            currentPage: number;
        };
    };
    key?: string[];
    header?: string[];
    error?: boolean;
    errorMessage?: string;
}

interface DataTableProps {
    title: string;
    columns?: DataColumnDef[];
    data: any[] | ApiDataFormat;
    actions?: any;
    toolBar?: React.ReactNode | (() => React.ReactNode);
    checkboxSelection?: boolean;
    onSelectionModelChange?: (selection: any[]) => void;
    selectionModel?: any[];
    headerBackground?: string;
    headerColor?: string;
    paginationModel?: { page: number; pageSize: number };
    onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
    searchable?: boolean;
    searchPlaceholder?: string;
    searchColumn?: string;
    loading?: boolean;
    striped?: boolean;
    noHorizontalScroll?: boolean;
}

// Helper function to escape CSV values
function escapeCSV(value: any): string {
    const str = value === null || value === undefined ? "" : String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// Skeleton row component for loading state
function SkeletonRow({ columns }: { columns: number }) {
    return (
        <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
                <TableCell key={i} className="text-sm whitespace-nowrap">
                    <div className="h-4 bg-muted/40 rounded animate-pulse w-3/4" />
                </TableCell>
            ))}
        </TableRow>
    );
}

// Hook to detect scroll overflow and position
function useScrollOverflow(ref: React.RefObject<HTMLElement | null>) {
    const [overflowState, setOverflowState] = React.useState({
        canScrollLeft: false,
        canScrollRight: false,
    });

    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const update = () => {
            setOverflowState({
                canScrollLeft: el.scrollLeft > 0,
                canScrollRight: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
            });
        };

        update();

        el.addEventListener("scroll", update);
        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(el);

        return () => {
            el.removeEventListener("scroll", update);
            resizeObserver.disconnect();
        };
    }, [ref]);

    return overflowState;
}

export function DataTable({
    title,
    columns: externalColumns,
    data: rawData,
    actions,
    toolBar,
    checkboxSelection = true,
    onSelectionModelChange,
    selectionModel = [],
    headerBackground = "#0f766e",
    headerColor = "#ffffff",
    paginationModel = { page: 0, pageSize: 10 },
    onPaginationModelChange,
    searchable = false,
    searchPlaceholder = "Buscar...",
    searchColumn,
    loading = false,
    striped = true,
    noHorizontalScroll = false,
}: DataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const overflowState = useScrollOverflow(scrollContainerRef);

    // Detectar formato de datos y normalizar
    const { tableData, totalItems, totalPages, keys, headers, hasError, errorMessage } = React.useMemo(() => {
        if (Array.isArray(rawData)) {
            return {
                tableData: rawData,
                totalItems: rawData.length,
                totalPages: 1,
                keys: [],
                headers: [],
                hasError: false,
                errorMessage: '',
            };
        }

        // Formato del API
        const apiData = rawData as ApiDataFormat;
        const items = apiData?.data?.items || [];
        const meta = apiData?.data?.meta;

        return {
            tableData: items,
            totalItems: meta?.totalItems || items.length,
            totalPages: meta?.totalPages || 1,
            keys: apiData?.key || [],
            headers: apiData?.header || [],
            hasError: apiData?.error || false,
            errorMessage: apiData?.errorMessage || '',
        };
    }, [rawData]);

    // Crear columnas desde el formato anterior si no se proporcionan
    const columns = React.useMemo(() => {
        if (externalColumns) return externalColumns;

        // Crear columnas desde keys y headers
        // IMPORTANTE: mantener la correlación original entre keys y headers aunque se filtre 'id'
        const filteredKeys = keys.filter(key => key !== 'id' && key !== 'action');
        const generatedColumns: DataColumnDef[] = filteredKeys.map((key) => {
            // Buscar el índice original del key en el array de keys para obtener el header correcto
            const originalIndex = keys.indexOf(key);
            return {
                accessorKey: key,
                header: headers[originalIndex] || key,
                cell: ({ row }: { row: any }) => {
                    const value = row.original[key];
                    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value) && !isNaN(Date.parse(value))) {
                        return formatFechaHumana(value);
                    }
                    return value;
                },
            };
        });

        // Agregar columna de acciones si existe
        if (actions && !keys.includes('action')) {
            generatedColumns.push({
                id: 'actions',
                header: 'Acciones',
                cell: ({ row }: { row: any }) => {
                    if (actions.renderCell) {
                        return actions.renderCell(row.original);
                    }
                    return actions;
                },
            });
        }

        return generatedColumns;
    }, [externalColumns, keys, headers, actions]);

    // Columna de selección
    const selectionColumn: DataColumnDef = {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                indeterminate={
                    table.getIsSomePageRowsSelected() &&
                    !table.getIsAllPageRowsSelected()
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Seleccionar todo"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Seleccionar fila"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    };

    const allColumns = checkboxSelection ? [selectionColumn, ...columns] : columns;

    // Sincronizar selección externa con interna
    React.useEffect(() => {
        if (!checkboxSelection || !selectionModel || !tableData) return;
        const newSelection: RowSelectionState = {};
        tableData.forEach((row: any, index: number) => {
            if (row.id && selectionModel.some(s => s === row.id || s === String(row.id))) {
                newSelection[index] = true;
            }
        });
        // Bailout: si la selección resultante es idéntica, devolver prev para
        // evitar re-render en bucle (selectionModel default [] es ref nueva por render)
        setRowSelection(prev => {
            const keys = Object.keys(newSelection);
            if (Object.keys(prev).length === keys.length && keys.every(k => prev[k] === true)) {
                return prev;
            }
            return newSelection;
        });
    }, [checkboxSelection, selectionModel, tableData]);

    const table = useTable({
        features: dataTableFeatures,
        data: tableData,
        columns: allColumns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: (updater) => {
            const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
            setRowSelection(newSelection);

            if (onSelectionModelChange && tableData) {
                const selectedIds = Object.keys(newSelection)
                    .filter(key => newSelection[key])
                    .map(index => tableData[parseInt(index)]?.id)
                    .filter(Boolean);
                onSelectionModelChange(selectedIds);
            }
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        manualPagination: true,
        pageCount: totalPages,
    });

    // CSV Export function
    const exportCSV = React.useCallback(() => {
        const visibleRows = table.getRowModel().rows;
        if (visibleRows.length === 0) return;

        // Get visible column headers (exclude select column)
        const visibleColumns = table.getVisibleLeafColumns().filter(col => col.id !== 'select' && col.id !== 'actions');
        const headerRow = visibleColumns.map(col => {
            const header = col.columnDef.header;
            if (typeof header === 'string') return escapeCSV(header);
            const id = col.id || (col as any).accessorKey || '';
            return escapeCSV(id);
        }).join(",");

        // Build data rows
        const dataRows = visibleRows.map(row => {
            const cells = visibleColumns.map(col => {
                const accessorKey = (col as any).accessorKey;
                const value = accessorKey ? row.original[accessorKey] : '';
                return escapeCSV(value);
            });
            return cells.join(",");
        });

        const csvContent = [headerRow, ...dataRows].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${title.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [table, title]);

    // Calculate visible row range for display
    const firstRowIndex = totalItems > 0 ? paginationModel.page * paginationModel.pageSize + 1 : 0;
    const lastRowIndex = Math.min((paginationModel.page + 1) * paginationModel.pageSize, totalItems);

    // Helper to get sticky styles for headers
    const getHeaderStickyStyles = (headerId: string) => {
        if (headerId === 'select') {
            return cn(
                "sticky left-0 z-20 bg-background",
                "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]",
            );
        }
        if (headerId === 'actions') {
            return cn(
                "sticky right-0 z-20 bg-background",
                "shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.05)]",
            );
        }
        return "";
    };

    // Get cell-level sticky styles with row background support
    const getCellStickyStyles = (columnId: string, rowIndex: number, isSelected: boolean) => {
        if (columnId === 'select') {
            return cn(
                "sticky left-0 z-20",
                isSelected
                    ? "bg-muted"
                    : striped && rowIndex % 2 === 1
                        ? "bg-muted/20"
                        : "bg-background",
            );
        }
        if (columnId === 'actions') {
            return cn(
                "sticky right-0 z-20",
                isSelected
                    ? "bg-muted"
                    : striped && rowIndex % 2 === 1
                        ? "bg-muted/20"
                        : "bg-background",
            );
        }
        return "";
    };

    if (loading || !tableData) {
        return (
            <div className="w-full">
                <div className="rounded-md border">
                    <div
                        className="flex items-center justify-between px-4 py-3"
                        style={{ background: headerBackground, color: headerColor }}
                    >
                        <h2 className="text-lg font-semibold">{title}</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <Table className="table-fixed">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    {checkboxSelection && (
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap w-[40px]">
                                            <div className="h-4 w-4" />
                                        </TableHead>
                                    )}
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <TableHead key={i} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                                            <div className="h-3 bg-muted/40 rounded animate-pulse w-20" />
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                                        <div className="h-3 bg-muted/40 rounded animate-pulse w-16" />
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <SkeletonRow key={i} columns={checkboxSelection ? 7 : 6} />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-between px-4 py-4 border-t">
                        <div className="h-4 w-40 bg-muted/40 rounded animate-pulse" />
                        <div className="h-4 w-48 bg-muted/40 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="rounded-md border">
                {/* Header */}
                <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-3"
                    style={{ background: headerBackground, color: headerColor }}
                >
                    <h2 className="text-base sm:text-lg font-semibold truncate">{title}</h2>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        {toolBar && <div>{typeof toolBar === 'function' ? toolBar() : toolBar}</div>}

                        {/* Export Button */}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20" style={{ color: headerColor }} />}
                            >
                                <Download className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="text-xs">Exportar</DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    Exportar CSV
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Column Visibility Toggle */}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20" style={{ color: headerColor }} />}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="text-xs">Columnas visibles</DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize cursor-pointer"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(!!value)
                                                }
                                            >
                                                {column.id === 'actions' ? 'Acciones' :
                                                    (column.columnDef.header as string) || column.id}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Search */}
                {searchable && searchColumn && (
                    <div className="px-3 sm:px-4 py-2 sm:py-3 border-b">
                        <Input
                            placeholder={searchPlaceholder}
                            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn(searchColumn)?.setFilterValue(event.target.value)
                            }
                            className="w-full sm:max-w-sm"
                        />
                    </div>
                )}

                {/* Table - horizontal scroll with overflow indicators */}
                <div className="relative">
                    {/* Left scroll shadow indicator */}
                    {!noHorizontalScroll && overflowState.canScrollLeft && (
                        <div className="absolute left-0 top-0 bottom-0 w-8 z-30 pointer-events-none bg-gradient-to-r from-background to-transparent" />
                    )}
                    {/* Right scroll shadow indicator */}
                    {!noHorizontalScroll && overflowState.canScrollRight && (
                        <div className="absolute right-0 top-0 bottom-0 w-8 z-30 pointer-events-none bg-gradient-to-l from-background to-transparent" />
                    )}
                    <div
                        ref={scrollContainerRef}
                        className={noHorizontalScroll ? "" : "overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30"}
                    >
                        <Table className="w-full min-w-[600px]">
                            <colgroup>
                                {allColumns.map((col, colIdx) => (
                                    <col
                                        key={col.id ?? (col as any).accessorKey ?? colIdx}
                                        className={cn(
                                            col.id === 'select' && 'w-[48px]',
                                            col.id === 'actions' && 'w-[100px]',
                                            col.id !== 'select' && col.id !== 'actions' && (noHorizontalScroll ? '' : 'max-w-[300px]'),
                                        )}
                                    />
                                ))}
                            </colgroup>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                        {headerGroup.headers.map((header) => {
                                            const isSticky = header.id === 'select' || header.id === 'actions';
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    className={cn(
                                                        "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                                                        isSticky ? "whitespace-nowrap" : noHorizontalScroll ? "" : "truncate max-w-[300px]",
                                                        isSticky && getHeaderStickyStyles(header.id),
                                                        header.id === 'select' && "w-[48px]",
                                                    )}
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <div
                                                            className={`flex items-center gap-1 ${
                                                                header.column.getCanSort() ? "cursor-pointer select-none" : ""
                                                            }`}
                                                            onClick={header.column.getToggleSortingHandler()}
                                                        >
                                                            {flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                            {header.column.getCanSort() && (
                                                                <span className="ml-1">
                                                                    {header.column.getIsSorted() === "asc" ? (
                                                                        <ArrowUp className="h-3 w-3" />
                                                                    ) : header.column.getIsSorted() === "desc" ? (
                                                                        <ArrowDown className="h-3 w-3" />
                                                                    ) : (
                                                                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row, rowIndex) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className={cn(
                                                "group transition-colors hover:bg-muted/50 border-l-2 border-l-transparent hover:border-l-primary",
                                                striped && rowIndex % 2 === 1 && "bg-muted/20",
                                                row.getIsSelected() && "bg-muted border-l-primary"
                                            )}
                                        >
                                            {row.getVisibleCells().map((cell) => {
                                                const isSticky = cell.column.id === 'select' || cell.column.id === 'actions';
                                                return (
                                                    <TableCell
                                                        key={cell.id}
                                                        className={cn(
                                                            "text-sm",
                                                            isSticky ? "whitespace-nowrap" : noHorizontalScroll ? "" : "max-w-[300px] truncate",
                                                            isSticky && getCellStickyStyles(cell.column.id, rowIndex, row.getIsSelected()),
                                                            isSticky && "group-hover:bg-muted/50",
                                                            isSticky && row.getIsSelected() && "group-hover:bg-muted",
                                                        )}
                                                        title={isSticky ? undefined : (String(cell.getValue()) || undefined)}
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={allColumns.length}
                                            className="h-32 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                {hasError ? (
                                                    <>
                                                        <ShieldAlert className="h-8 w-8 text-amber-500" />
                                                        <p className="text-sm font-medium text-amber-600">
                                                            Error de conexión
                                                        </p>
                                                        <p className="text-xs text-muted-foreground/70">
                                                            {errorMessage || 'No se pudo conectar con el servidor'}
                                                        </p>
                                                    </>
                                                ) : searchable && columnFilters.length > 0 ? (
                                                    <>
                                                        <SearchX className="h-8 w-8 text-muted-foreground/40" />
                                                        <p className="text-sm font-medium text-muted-foreground">
                                                            No se encontraron resultados
                                                        </p>
                                                        <p className="text-xs text-muted-foreground/70">
                                                            Intenta con otros términos de búsqueda
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Inbox className="h-8 w-8 text-muted-foreground/40" />
                                                        <p className="text-sm font-medium text-muted-foreground">
                                                            No hay datos que mostrar
                                                        </p>
                                                        <p className="text-xs text-muted-foreground/70">
                                                            No se encontraron registros en la base de datos
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 py-3 sm:py-4 border-t gap-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        {checkboxSelection && (
                            <span className="hidden sm:inline">
                                {table.getFilteredSelectedRowModel().rows.length} de{" "}
                                {table.getFilteredRowModel().rows.length} seleccionada(s)
                            </span>
                        )}
                        <span>
                            Mostrando {firstRowIndex}-{lastRowIndex} de {totalItems}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">Filas:</span>
                            <Select
                                value={`${paginationModel.pageSize}`}
                                onValueChange={(value) => {
                                    onPaginationModelChange?.({
                                        page: 0,
                                        pageSize: Number(value),
                                    });
                                }}
                            >
                                <SelectTrigger className="h-8 w-[60px] sm:w-[70px]">
                                    <SelectValue placeholder={paginationModel.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 30, 50, 100].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8"
                                onClick={() => onPaginationModelChange?.({ ...paginationModel, page: 0 })}
                                disabled={paginationModel.page === 0}
                            >
                                <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8"
                                onClick={() => onPaginationModelChange?.({ ...paginationModel, page: paginationModel.page - 1 })}
                                disabled={paginationModel.page === 0}
                            >
                                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <span className="text-xs sm:text-sm px-1 sm:px-2 whitespace-nowrap">
                                {paginationModel.page + 1}/{totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8"
                                onClick={() => onPaginationModelChange?.({ ...paginationModel, page: paginationModel.page + 1 })}
                                disabled={paginationModel.page >= totalPages - 1}
                            >
                                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8"
                                onClick={() => onPaginationModelChange?.({ ...paginationModel, page: totalPages - 1 })}
                                disabled={paginationModel.page >= totalPages - 1}
                            >
                                <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Utility function to create columns from data structure
export function createColumns<T extends RowData>(
    keys: string[],
    headers: string[],
    customRenderers?: Record<string, (value: any, row: T) => React.ReactNode>
): DataColumnDef<T>[] {
    // Mantener la correlación original entre keys y headers aunque se filtre 'id'
    const filteredKeys = keys.filter(key => key !== 'id' && key !== 'action');
    return filteredKeys.map((key) => {
        // Buscar el índice original del key en el array de keys para obtener el header correcto
        const originalIndex = keys.indexOf(key);
        return {
            accessorKey: key,
            header: headers[originalIndex] || key,
            cell: customRenderers?.[key]
                ? ({ row }: { row: any }) => customRenderers[key](row.original[key], row.original)
                : ({ row }: { row: any }) => row.original[key],
        };
    });
}
