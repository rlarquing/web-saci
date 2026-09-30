"use client"

import { useState, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, X, ChevronRight, ChevronsRight, ChevronsLeft } from "lucide-react"

interface TransferListItem {
  value: string
  label: string
}

interface TransferListBaseProps {
  items: TransferListItem[]
  selected: string[]
  onChange: (selected: string[]) => void
  availableLabel?: string
  selectedLabel?: string
  searchPlaceholder?: string
  emptyText?: string
  height?: number
}

type TransferListProps = TransferListBaseProps &
  Omit<React.ComponentPropsWithoutRef<"div">, "onChange">

export function TransferList({
  items,
  selected,
  onChange,
  availableLabel = "Disponibles",
  selectedLabel = "Seleccionados",
  searchPlaceholder = "Buscar...",
  emptyText = "No hay elementos",
  height = 280,
  className,
  ...divProps
}: TransferListProps) {
  // Normalizar todos los valores a string al entrar
  const stringItems = useMemo(
    () => items.map((item) => ({ value: String(item.value), label: item.label })),
    [items],
  )

  // Available = all items minus selected
  const availableItems = useMemo(
    () => stringItems.filter((item) => !selected.includes(item.value)),
    [stringItems, selected],
  )

  const selectedItems = useMemo(
    () => stringItems.filter((item) => selected.includes(item.value)),
    [stringItems, selected],
  )

  // Search filter
  const [search, setSearch] = useState("")
  const filteredAvailable = useMemo(
    () =>
      search
        ? availableItems.filter((item) =>
            item.label.toLowerCase().includes(search.toLowerCase()),
          )
        : availableItems,
    [availableItems, search],
  )

  // Checked items in the available list
  const [checkedAvailable, setCheckedAvailable] = useState<Set<string>>(new Set())

  const toggleCheckAvailable = (value: string) => {
    setCheckedAvailable((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const handleAddSelected = useCallback(() => {
    if (checkedAvailable.size === 0) return
    onChange([...selected, ...Array.from(checkedAvailable)])
    setCheckedAvailable(new Set())
    setSearch("")
  }, [checkedAvailable, onChange, selected])

  const handleAddAll = useCallback(() => {
    const remaining = availableItems.map((i) => i.value)
    if (remaining.length === 0) return
    onChange([...selected, ...remaining])
    setCheckedAvailable(new Set())
    setSearch("")
  }, [availableItems, onChange, selected])

  const handleRemoveSingle = useCallback(
    (value: string) => {
      onChange(selected.filter((v) => v !== value))
    },
    [onChange, selected],
  )

  const handleRemoveAll = useCallback(() => {
    onChange([])
  }, [onChange])

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto_1fr] gap-3",
        "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
        "rounded-md", // so the ring shows rounded
        className,
      )}
      {...divProps}
    >
      {/* ── Left: Available ── */}
      <div className="border rounded-md">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
          <span className="text-sm font-medium">
            {availableLabel}{" "}
            <span className="text-muted-foreground font-normal">
              ({availableItems.length})
            </span>
          </span>
        </div>

        <div className="p-2 pb-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>

        {/* Select all / clear for visible items */}
        {filteredAvailable.length > 0 && (
          <div className="flex items-center justify-between px-3 py-1">
            <button
              type="button"
              onClick={() => {
                const allVisible = new Set(
                  checkedAvailable.size === filteredAvailable.length
                    ? []
                    : filteredAvailable.map((i) => i.value),
                )
                setCheckedAvailable(allVisible)
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {checkedAvailable.size === filteredAvailable.length &&
              filteredAvailable.length > 0
                ? "Deseleccionar todos"
                : "Seleccionar todos"}
            </button>
            {checkedAvailable.size > 0 && (
              <span className="text-xs text-muted-foreground">
                {checkedAvailable.size} seleccionados
              </span>
            )}
          </div>
        )}

        {/* Available items list — click on row adds immediately */}
        <div
          className="overflow-y-auto"
          style={{ height: height - 120 }}
        >
          {filteredAvailable.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {availableItems.length === 0 && stringItems.length > 0
                ? "Todos los endpoints seleccionados"
                : search
                  ? "Sin resultados"
                  : emptyText}
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredAvailable.map((item) => (
                <div
                  key={item.value}
                  className="group flex items-center gap-2.5 px-3 py-2 hover:bg-muted/50 cursor-pointer text-sm transition-colors"
                  onClick={() => {
                    // Direct click: add to selected immediately
                    onChange([...selected, item.value])
                    // Clean up any pending checkbox
                    setCheckedAvailable((prev) => {
                      const next = new Set(prev)
                      next.delete(item.value)
                      return next
                    })
                  }}
                >
                  {/* Outer div stops row onClick when clicking checkbox */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={checkedAvailable.has(item.value)}
                      onCheckedChange={() => toggleCheckAvailable(item.value)}
                    />
                  </div>
                  <span className="truncate flex-1">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Center: Action buttons ── */}
      <div className="flex flex-col items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleAddSelected}
          disabled={checkedAvailable.size === 0}
          title="Agregar seleccionados"
          className="size-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleAddAll}
          disabled={availableItems.length === 0}
          title="Agregar todos"
          className="size-9"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRemoveAll}
          disabled={selected.length === 0}
          title="Quitar todos"
          className="size-9"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Right: Selected ── */}
      <div className="border rounded-md">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
          <span className="text-sm font-medium">
            {selectedLabel}{" "}
            <span className="text-muted-foreground font-normal">
              ({selected.length})
            </span>
          </span>
        </div>

        <div
          className="overflow-y-auto p-1"
          style={{ height: height - 44 }}
        >
          {selectedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {emptyText}
            </p>
          ) : (
            <div className="space-y-0.5">
              {selectedItems.map((item) => (
                <div
                  key={item.value}
                  className="group flex items-center gap-2 px-2.5 py-1.5 hover:bg-muted/50 rounded-sm text-sm transition-colors cursor-pointer"
                  onClick={() => handleRemoveSingle(item.value)}
                >
                  <span className="flex-1 truncate">{item.label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveSingle(item.value)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
