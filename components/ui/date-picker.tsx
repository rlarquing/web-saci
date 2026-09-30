"use client"

import * as React from "react"
import dayjs from "dayjs"
import type { DayPickerProps, Matcher } from "react-day-picker"
import "dayjs/locale/es"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

type SingleModeProps = Extract<DayPickerProps, { mode: "single" }>

type DatePickerProps = Omit<
  SingleModeProps,
  "mode" | "selected" | "onSelect" | "disabled"
> & {
  /** Fecha seleccionada (undefined = sin selección). */
  value?: Date
  /** Se llama al seleccionar una fecha; con undefined al limpiar. */
  onValueChange?: (date: Date | undefined) => void
  /** Placeholder cuando no hay fecha seleccionada. */
  placeholder?: string
  /** Deshabilita el trigger (y con él los días del calendario). */
  disabled?: boolean
  /** Días no seleccionables del calendario (matchers de react-day-picker). */
  disabledDays?: Matcher | Matcher[]
  /** Formato de dayjs para mostrar la fecha. Default "DD/MM/YYYY". */
  format?: string
  /** id para el botón trigger (útil para <Label htmlFor>). */
  buttonId?: string
  className?: string
  buttonClassName?: string
  /** Contenido extra mostrado bajo el calendario (ej. botón "Hoy"). */
  footer?: React.ReactNode
}

/**
 * Date picker compuesto: Popover (Base UI) + Calendar (react-day-picker).
 *
 * @example
 * <DatePicker value={fecha} onValueChange={setFecha} />
 */
function DatePicker({
  value,
  onValueChange,
  placeholder = "Selecciona una fecha",
  disabled,
  format = "DD/MM/YYYY",
  buttonId,
  className,
  buttonClassName,
  footer,
  disabledDays,
  ...calendarProps
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            id={buttonId}
            variant="outline"
            aria-haspopup="dialog"
            disabled={disabled}
            data-empty={!value}
            className={cn(
              "w-full justify-start gap-2 px-2.5 text-left font-normal data-[empty=true]:text-muted-foreground active:translate-y-0",
              buttonClassName
            )}
          />
        }
      >
        <CalendarIcon className="size-4 text-muted-foreground" />
        {value ? dayjs(value).format(format) : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-auto p-0", className)}>
        <Calendar
          mode="single"
          autoFocus
          captionLayout="dropdown"
          selected={value}
          onSelect={(date) => {
            onValueChange?.(date)
            setOpen(false)
          }}
          disabled={disabled ? true : disabledDays}
          {...calendarProps}
        />
        {footer ? <div className="border-t p-2">{footer}</div> : null}
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, type DatePickerProps }
