"use client"

import React from "react"
import { Control, FieldPath, FieldValues } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField as BaseFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface BaseFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>
  name: TName
  label: string
  description?: string
  placeholder?: string
  disabled?: boolean
}

interface TextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFormFieldProps<TFieldValues, TName> {
  type?: "text" | "email" | "password" | "number" | "tel" | "date"
}

interface TextAreaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFormFieldProps<TFieldValues, TName> {
  rows?: number
}

interface SelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFormFieldProps<TFieldValues, TName> {
  options: Array<{ value: string; label: string }>
}

// Text Input Field Component
export function TextField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  placeholder,
  type = "text",
  disabled = false,
}: TextFieldProps<TFieldValues, TName>) {
  return (
    <BaseFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Textarea Field Component
export function TextAreaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  placeholder,
  rows = 3,
  disabled = false,
}: TextAreaFieldProps<TFieldValues, TName>) {
  return (
    <BaseFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Select Field Component
export function SelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  placeholder,
  options,
  disabled = false,
}: SelectFieldProps<TFieldValues, TName>) {
  // Filter out duplicate values to prevent React key warnings and selection issues
  const uniqueOptions = React.useMemo(() => {
    const seen = new Set()
    return options.filter(option => {
      if (seen.has(option.value)) {
        console.warn(`Duplicate option value removed: ${option.value} (${option.label})`)
        return false
      }
      seen.add(option.value)
      return true
    })
  }, [options])

  return (
    <BaseFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value ? String(field.value) : ""}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {uniqueOptions.map((option, index) => (
                <SelectItem 
                  key={`${name}-${option.value}-${index}`}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Array Input Field Component for handling string arrays (like ingredients, health benefits, etc.)
interface ArrayFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFormFieldProps<TFieldValues, TName> {
  maxItems?: number
  itemPlaceholder?: string
}

export function ArrayField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  placeholder,
  maxItems = 10,
  itemPlaceholder = "Enter item",
  disabled = false,
}: ArrayFieldProps<TFieldValues, TName>) {
  const [inputValue, setInputValue] = React.useState("")

  return (
    <BaseFormField
      control={control}
      name={name}
      render={({ field }) => {
        const items = (field.value as string[]) || []
        
        const addItem = () => {
          if (inputValue.trim() && items.length < maxItems) {
            const newItems = [...items, inputValue.trim()]
            field.onChange(newItems)
            setInputValue("")
          }
        }
        
        const removeItem = (index: number) => {
          const newItems = items.filter((_: string, i: number) => i !== index)
          field.onChange(newItems)
        }
        
        const handleKeyPress = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addItem()
          }
        }

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder={itemPlaceholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={disabled || items.length >= maxItems}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addItem}
                    disabled={!inputValue.trim() || items.length >= maxItems || disabled}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {items.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {items.map((item: string, index: number) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {item}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeItem(index)}
                          disabled={disabled}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
                {maxItems && (
                  <p className="text-xs text-muted-foreground">
                    {items.length}/{maxItems} items
                  </p>
                )}
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

// Checkbox Field Component
interface CheckboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFormFieldProps<TFieldValues, TName> {}

export function CheckboxField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  disabled = false,
}: CheckboxFieldProps<TFieldValues, TName>) {
  return (
    <BaseFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <input
              type="checkbox"
              checked={field.value}
              onChange={field.onChange}
              disabled={disabled}
              className="rounded"
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}