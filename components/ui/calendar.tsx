"use client"

import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayPickerProps,
} from "react-day-picker"
import { es } from "react-day-picker/locale"

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * Calendar component based on react-day-picker v9, styled to match the
 * project's design system (shadcn-style Tailwind v4 classes).
 *
 * Reference: https://daypicker.dev
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: DayPickerProps & {
  buttonVariant?: "default" | "outline" | "ghost" | "link" | "secondary" | "destructive"
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      locale={es}
      className={cn("bg-background p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        nav: "flex items-center gap-1 w-full absolute inset-x-0 top-0 justify-between",
        button_previous: cn(
          buttonVariants({ variant: buttonVariant, size: "icon-sm" }),
          "size-7 bg-transparent p-0 opacity-60 hover:opacity-100",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, size: "icon-sm" }),
          "size-7 bg-transparent p-0 opacity-60 hover:opacity-100",
          defaultClassNames.button_next
        ),
        month_caption: "flex h-7 items-center justify-center text-sm font-medium w-full",
        dropdowns: "flex h-7 items-center justify-center gap-1.5 text-sm font-medium w-full",
        dropdown_root: "relative has-focus:ring-3 ring-ring/50 rounded-md border border-input bg-transparent",
        dropdown: "absolute inset-0 opacity-0 appearance-none bg-popover",
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label" && "text-sm",
          captionLayout === "dropdown" && "rounded-md pl-2 pr-1 text-sm"
        ),
        months_dropdown: "cursor-pointer",
        years_dropdown: "cursor-pointer",
        weekdays: "flex",
        weekday: "flex-1 rounded-md w-9 font-normal text-[0.8rem] text-muted-foreground select-none",
        week: "flex w-full mt-2",
        day: "relative w-9 h-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "default" }),
          "size-9 p-0 font-normal aria-selected:opacity-100"
        ),
        range_start: "range-start rounded-l-md bg-accent",
        range_end: "range-end rounded-r-md bg-accent",
        selected: "bg-primary text-primary-foreground rounded-md focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground rounded-md",
        outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-primary/10 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "range-middle aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className="size-4" {...chevronProps} />
          ) : orientation === "down" ? (
            <ChevronDownIcon className="size-4" {...chevronProps} />
          ) : (
            <ChevronRightIcon className="size-4" {...chevronProps} />
          ),
        ...components,
      }}
      formatters={{
        formatCaption: (date) =>
          new Intl.DateTimeFormat("es", { month: "long", year: "numeric" }).format(date),
        formatWeekdayName: (date) =>
          new Intl.DateTimeFormat("es", { weekday: "short" })
            .format(date)
            .replace(".", "")
            .replace(/^\w/, (c) => c.toUpperCase()),
        ...formatters,
      }}
      {...props}
    />
  )
}

export { Calendar, type DayPickerProps }
