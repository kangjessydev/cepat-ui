// src/components/AutoForm/types.ts

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'toggle'
  | 'radio'
  | 'date'
  | 'datetime'
  | 'file'
  | 'hidden'

export interface SelectOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

export interface FieldSchema {
  name: string
  type: FieldType
  label?: string
  placeholder?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  default?: unknown
  /** For select, multiselect, radio */
  options?: SelectOption[] | string[]
  /** Validation rules */
  rules?: FieldRule[]
  /** Grid column span (1-12) */
  span?: number
  /** For date/datetime: use browser native picker if true, or custom Cepat calendar if false (default: false) */
  native?: boolean
  minDate?: string
  maxDate?: string
  /** Show field only if condition is true */
  showIf?: (values: Record<string, unknown>) => boolean
}

export interface FieldRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom'
  value?: number | string | RegExp
  message: string
  validate?: (value: unknown) => boolean
}

export interface FormSchema {
  fields: FieldSchema[]
  /** Number of columns in form grid. Default: 1 */
  columns?: 1 | 2 | 3
  submitLabel?: string
  cancelLabel?: string
}
