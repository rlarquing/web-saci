"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { cn } from "@/lib/utils"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"

interface ComboBoxOption {
  value: string
  label: string
  disabled?: boolean
}

interface ComboBoxProps {
  id?: string
  multiple?: boolean
  value?: ComboBoxOption | ComboBoxOption[] | string | string[] | number | number[] | null
  setValue: (value: any) => void
  options: ComboBoxOption[]
  width?: string | number
  helperText?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  returnFullObject?: boolean
}

type ComboboxItemValue = { label: string; value: string }

export function ComboBox({
  id,
  value,
  setValue,
  options,
  width,
  multiple = false,
  helperText,
  placeholder = "Seleccione una opción",
  searchPlaceholder = "Buscar...",
  emptyText = "No se encontraron resultados",
  disabled = false,
  className,
  returnFullObject = false,
}: ComboBoxProps) {
  const anchor = useComboboxAnchor()

  // Normalize all option values to strings for consistent comparison
  const stringOptions = React.useMemo(
    () =>
      options.map((opt) => ({
        ...opt,
        value: String(opt.value),
      })),
    [options]
  )

  // Build the items array for Base UI Combobox
  const comboboxItems = React.useMemo(
    () => stringOptions.map((opt) => ({ label: opt.label, value: opt.value })),
    [stringOptions]
  )

  // Extract string value(s) from the prop value
  const selectedStringValues = React.useMemo(() => {
    if (value == null) return multiple ? [] as string[] : null as string | null
    if (value === "") return multiple ? [] as string[] : null as string | null

    if (multiple) {
      const values = Array.isArray(value) ? value : [value]
      return values.map((v) => {
        if (typeof v === "object" && v !== null && "value" in v) {
          return String(v.value)
        }
        return String(v)
      })
    } else {
      if (typeof value === "object" && value !== null && "value" in value) {
        return String(value.value)
      }
      return String(value)
    }
  }, [value, multiple])

  // For single select: find the selected item object (Base UI expects Value | null)
  const selectedItem: ComboboxItemValue | null = React.useMemo(() => {
    if (multiple || !selectedStringValues) return null
    return comboboxItems.find((item) => item.value === selectedStringValues) ?? null
  }, [multiple, selectedStringValues, comboboxItems])

  // For multiple select: find all selected item objects (Base UI expects Value[])
  const selectedItems: ComboboxItemValue[] = React.useMemo(() => {
    if (!multiple) return []
    const vals = selectedStringValues as string[]
    return vals
      .map((v) => comboboxItems.find((item) => item.value === v))
      .filter(Boolean) as ComboboxItemValue[]
  }, [multiple, selectedStringValues, comboboxItems])

  // Handle value change for single select
  const handleSingleValueChange = React.useCallback(
    (item: ComboboxItemValue | null) => {
      if (item) {
        if (returnFullObject) {
          const opt = stringOptions.find((o) => o.value === item.value)
          setValue(opt ?? null)
        } else {
          setValue(item.value)
        }
      } else {
        setValue(null)
      }
    },
    [returnFullObject, stringOptions, setValue]
  )

  // Handle value change for multiple select
  const handleMultipleValueChange = React.useCallback(
    (items: ComboboxItemValue[]) => {
      if (returnFullObject) {
        const opts = items
          .map((item) => stringOptions.find((o) => o.value === item.value))
          .filter(Boolean) as ComboBoxOption[]
        setValue(opts)
      } else {
        setValue(items.map((item) => item.value))
      }
    },
    [returnFullObject, stringOptions, setValue]
  )

  // itemToStringLabel - tells Base UI how to display the selected item in the input
  const itemToStringLabel = React.useCallback(
    (item: ComboboxItemValue) => item.label,
    []
  )

  // itemToStringValue - tells Base UI how to convert items to searchable/form text
  const itemToStringValue = React.useCallback(
    (item: ComboboxItemValue) => item.value,
    []
  )

  const hasValue = multiple
    ? (selectedStringValues as string[]).length > 0
    : selectedStringValues !== null

  // Simple (single) select
  if (!multiple) {
    return (
      <div className="space-y-2" style={{ width }}>
        <Combobox
          items={comboboxItems}
          value={selectedItem}
          onValueChange={handleSingleValueChange}
          itemToStringLabel={itemToStringLabel}
          itemToStringValue={itemToStringValue}
          disabled={disabled}
        >
          <ComboboxTrigger
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-input bg-clip-padding bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] data-open:border-ring data-open:ring-[3px] data-open:ring-ring/50 has-data-[slot=combobox-value]:text-foreground text-muted-foreground",
              className,
            )}
          >
            <ComboboxValue placeholder={placeholder} />
          </ComboboxTrigger>
          <ComboboxContent>
            <InputGroup>
              <ComboboxPrimitive.Input
                render={<InputGroupInput placeholder={searchPlaceholder} />}
              />
            </InputGroup>
            <ComboboxEmpty>{emptyText}</ComboboxEmpty>
            <ComboboxList>
              {(item: ComboboxItemValue) => {
                const option = stringOptions.find((o) => o.value === item.value)
                return (
                  <ComboboxItem
                    key={item.value}
                    value={item}
                    disabled={option?.disabled}
                    className="cursor-pointer"
                  >
                    <span className="flex-1 truncate">{item.label}</span>
                  </ComboboxItem>
                )
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        {helperText && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    )
  }

  // Multiple select with chips
  return (
    <div className="space-y-2" style={{ width }}>
      <Combobox
        items={comboboxItems}
        multiple
        value={selectedItems}
        onValueChange={handleMultipleValueChange}
        itemToStringLabel={itemToStringLabel}
        itemToStringValue={itemToStringValue}
        disabled={disabled}
      >
        <ComboboxChips
          ref={anchor}
          className={cn("cursor-pointer data-open:border-ring data-open:ring-[3px] data-open:ring-ring/50", className)}
        >
          {selectedItems.length === 0 ? (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          ) : (
            <ComboboxValue>
              {selectedItems.map((item) => (
                <ComboboxChip key={item.value}>
                  {item.label}
                </ComboboxChip>
              ))}
            </ComboboxValue>
          )}
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <InputGroup>
            <ComboboxPrimitive.Input
              render={<InputGroupInput placeholder={searchPlaceholder} />}
            />
          </InputGroup>
          <ComboboxEmpty>{emptyText}</ComboboxEmpty>
          <ComboboxList>
            {(item: ComboboxItemValue) => {
              const option = stringOptions.find((o) => o.value === item.value)
              return (
                <ComboboxItem
                  key={item.value}
                  value={item}
                  disabled={option?.disabled}
                  className="cursor-pointer"
                >
                  <span className="flex-1 truncate">{item.label}</span>
                </ComboboxItem>
              )
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}

// Utility function to create options from simple arrays
export function createOptions(
  items: string[] | { value: string | number; label: string }[]
): ComboBoxOption[] {
  return items.map((item) => {
    if (typeof item === "string") {
      return { value: item, label: item }
    }
    return { value: String(item.value), label: item.label }
  })
}
