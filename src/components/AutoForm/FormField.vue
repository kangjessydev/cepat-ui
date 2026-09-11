<template>
  <div :class="['form-field-wrapper', `col-span-${field.span ?? 1}`]">
    <!-- Label -->
    <label v-if="field.type !== 'checkbox' && field.type !== 'toggle' && field.label" :for="fieldId" class="field-label">
      {{ field.label }}
      <span v-if="field.required" class="required-mark">*</span>
    </label>

    <!-- Hint -->
    <p v-if="field.hint && field.type !== 'checkbox'" class="field-hint">{{ field.hint }}</p>

    <!-- TEXT / EMAIL / PASSWORD / NUMBER / TEL / URL -->
    <div v-if="['text','email','password','number','tel','url'].includes(field.type)" class="input-wrapper" :class="{ error: !!error, disabled: field.disabled }">
      <input
        :id="fieldId"
        v-model="internalValue"
        :type="field.type === 'password' && showPassword ? 'text' : field.type"
        class="field-input"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
        :readonly="field.readonly"
        :required="field.required"
        @blur="validate"
      />
      <button v-if="field.type === 'password'" type="button" class="input-action" @click="showPassword = !showPassword">
        <Eye v-if="!showPassword" :size="15" />
        <EyeOff v-else :size="15" />
      </button>
    </div>

    <!-- TEXTAREA -->
    <textarea
      v-else-if="field.type === 'textarea'"
      :id="fieldId"
      v-model="internalValue"
      class="field-textarea"
      :class="{ error: !!error }"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      :readonly="field.readonly"
      rows="3"
      @blur="validate"
    />

    <!-- SELECT -->
    <select
      v-else-if="field.type === 'select'"
      :id="fieldId"
      v-model="internalValue"
      class="field-select"
      :class="{ error: !!error }"
      :disabled="field.disabled"
      @change="validate"
    >
      <option value="" disabled>{{ field.placeholder ?? 'Select an option' }}</option>
      <option
        v-for="opt in normalizedOptions"
        :key="String(opt.value)"
        :value="opt.value"
        :disabled="opt.disabled"
      >{{ opt.label }}</option>
    </select>

    <!-- CHECKBOX -->
    <label v-else-if="field.type === 'checkbox'" :for="fieldId" class="checkbox-label">
      <div class="custom-checkbox">
        <input
          :id="fieldId"
          v-model="internalValue"
          type="checkbox"
          class="checkbox-native"
          :disabled="field.disabled"
        />
        <span class="checkbox-box" :class="{ checked: !!internalValue }">
          <Check v-if="!!internalValue" :size="12" class="check-icon" />
        </span>
      </div>
      <span>{{ field.label }}</span>
      <span v-if="field.required" class="required-mark">*</span>
    </label>

    <!-- TOGGLE -->
    <div v-else-if="field.type === 'toggle'" class="toggle-wrapper">
      <button
        :id="fieldId"
        type="button"
        role="switch"
        :aria-checked="!!internalValue"
        class="toggle-btn"
        :class="{ on: !!internalValue }"
        :disabled="field.disabled"
        @click="internalValue = !internalValue"
      >
        <span class="toggle-thumb" />
      </button>
      <label :for="fieldId" class="toggle-label">{{ field.label }}</label>
    </div>

    <!-- RADIO -->
    <div v-else-if="field.type === 'radio'" class="radio-group">
      <label v-for="opt in normalizedOptions" :key="String(opt.value)" class="radio-label">
        <input
          v-model="internalValue"
          type="radio"
          :value="opt.value"
          :name="field.name"
          :disabled="field.disabled || opt.disabled"
          class="radio-input"
        />
        {{ opt.label }}
      </label>
    </div>

    <!-- DATE / DATETIME (Custom Cepat popover or native fallback) -->
    <BaseDatePicker
      v-else-if="['date', 'datetime'].includes(field.type)"
      :id="fieldId"
      v-model="internalValue"
      :type="field.type === 'datetime' ? 'datetime' : 'date'"
      :native="field.native ?? false"
      :placeholder="field.placeholder ?? (field.type === 'datetime' ? 'Select date & time...' : 'Select date...')"
      :disabled="field.disabled"
      :min-date="field.minDate"
      :max-date="field.maxDate"
      :has-error="!!error"
      @blur="validate"
      @change="validate"
    />

    <!-- FILE UPLOAD DROPZONE -->
    <div v-else-if="field.type === 'file'" class="file-upload-container">
      <input
        :id="fieldId"
        ref="fileInputRef"
        type="file"
        class="hidden-file-input"
        :disabled="field.disabled"
        @change="handleFileChange"
      />

      <!-- When a file is already selected -->
      <div v-if="selectedFile" class="file-preview-card">
        <div class="file-preview-info">
          <div class="file-icon-box">
            <FileText :size="20" class="file-icon" />
          </div>
          <div class="file-meta">
            <span class="file-name">{{ selectedFile.name }}</span>
            <span v-if="selectedFile.size" class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
          </div>
        </div>
        <button
          type="button"
          class="file-remove-btn"
          title="Remove file"
          :disabled="field.disabled"
          @click.stop="clearFile"
        >
          <X :size="16" />
        </button>
      </div>

      <!-- Drag and drop zone when no file selected -->
      <div
        v-else
        class="file-dropzone"
        :class="{ dragging: isDragging, error: !!error, disabled: field.disabled }"
        @click="triggerFileInput"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleFileDrop"
      >
        <div class="dropzone-icon">
          <UploadCloud :size="24" />
        </div>
        <div class="dropzone-text">
          <span class="dropzone-prompt">
            <strong>Click to upload</strong> or drag and drop
          </span>
          <span class="dropzone-hint">
            {{ field.placeholder ?? 'SVG, PNG, JPG, PDF or document (max. 10MB)' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <p v-if="error" class="field-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { Check, Eye, EyeOff, UploadCloud, FileText, X } from '@lucide/vue'
import BaseDatePicker from '@/components/BaseDatePicker.vue'
import type { FieldSchema, SelectOption } from './types'

const props = defineProps<{
  field: FieldSchema
  modelValue: unknown
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  'error': [field: string, error: string | null]
}>()

const fieldId = computed(() => `af-${props.field.name}`)
const showPassword = ref(false)
const error = ref<string | null>(null)

const internalValue = computed<any>({
  get: () => props.modelValue ?? props.field.default ?? '',
  set: (v) => emit('update:modelValue', v),
})

// Normalize options to { label, value } objects
const normalizedOptions = computed((): SelectOption[] => {
  return (props.field.options ?? []).map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )
})

function validate() {
  const value = internalValue.value
  const rules = props.field.rules ?? []

  // Built-in required check
  if (props.field.required) {
    const isEmpty = value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)
    if (isEmpty) {
      error.value = `${props.field.label ?? props.field.name} is required`
      emit('error', props.field.name, error.value)
      return false
    }
  }

  for (const rule of rules) {
    let valid = true
    switch (rule.type) {
      case 'minLength': valid = String(value).length >= Number(rule.value); break
      case 'maxLength': valid = String(value).length <= Number(rule.value); break
      case 'min': valid = Number(value) >= Number(rule.value); break
      case 'max': valid = Number(value) <= Number(rule.value); break
      case 'email': valid = /\S+@\S+\.\S+/.test(String(value)); break
      case 'pattern': valid = new RegExp(rule.value as string).test(String(value)); break
      case 'custom': valid = rule.validate?.(value) ?? true; break
    }
    if (!valid) {
      error.value = rule.message
      emit('error', props.field.name, error.value)
      return false
    }
  }

  error.value = null
  emit('error', props.field.name, null)
  return true
}

// File upload helpers
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const selectedFile = computed(() => {
  const val = internalValue.value
  if (!val) return null
  if (val instanceof File) {
    return { name: val.name, size: val.size }
  }
  if (typeof val === 'object' && 'name' in (val as Record<string, unknown>)) {
    return {
      name: String((val as Record<string, unknown>).name),
      size: Number((val as Record<string, unknown>).size ?? 0),
    }
  }
  if (typeof val === 'string' && val.trim().length > 0) {
    return { name: val, size: 0 }
  }
  return null
})

function triggerFileInput() {
  if (props.field.disabled) return
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  internalValue.value = file
  validate()
}

function handleFileDrop(e: DragEvent) {
  isDragging.value = false
  if (props.field.disabled) return
  const file = e.dataTransfer?.files?.[0] ?? null
  if (file) {
    internalValue.value = file
    validate()
  }
}

function clearFile() {
  internalValue.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  validate()
}

function formatFileSize(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

defineExpose({ validate })
</script>

<style scoped>
.form-field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.col-span-1 { grid-column: span 1; }
.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }
.col-span-full { grid-column: 1 / -1; }

@media (max-width: 768px) {
  .col-span-1,
  .col-span-2,
  .col-span-3,
  .col-span-full,
  .form-field-wrapper {
    grid-column: span 1 !important;
  }
}

.field-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.required-mark { color: #ef4444; }

.field-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-surface);
  transition: border-color 0.15s, box-shadow 0.15s;
  overflow: hidden;
}
.input-wrapper:focus-within { border-color: #10b981; box-shadow: 0 0 0 3px rgb(16 185 129 / 0.1); }
.input-wrapper.error { border-color: #ef4444; }
.input-wrapper.disabled { opacity: 0.6; background: var(--bg-surface-raised); }

.field-input {
  flex: 1;
  height: 38px;
  padding: 0 0.75rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.875rem;
  outline: none;
  font-family: inherit;
}
.field-input::placeholder { color: var(--text-muted); }

/* Also used standalone (date) */
input.field-input {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-surface);
}
input.field-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgb(16 185 129 / 0.1); outline: none; }
input.field-input.error { border-color: #ef4444; }

.input-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}
.input-action:hover { color: var(--text-secondary); }

.field-textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  resize: vertical;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field-textarea:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgb(16 185 129 / 0.1); }
.field-textarea.error { border-color: #ef4444; }
.field-textarea::placeholder { color: var(--text-muted); }

.field-select {
  width: 100%;
  height: 38px;
  padding: 0 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field-select:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgb(16 185 129 / 0.1); }
.field-select.error { border-color: #ef4444; }

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
}

.custom-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.checkbox-native {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  pointer-events: none;
}

.checkbox-box {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1.5px solid var(--border-color);
  background-color: var(--bg-surface);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.checkbox-label:hover .checkbox-box {
  border-color: #10b981;
  background-color: rgba(16, 185, 129, 0.06);
}

.checkbox-box.checked {
  background-color: #10b981;
  border-color: #10b981;
  box-shadow: 0 1px 2px rgba(16, 185, 129, 0.25);
}

.checkbox-native:focus-visible + .checkbox-box {
  outline: 2px solid rgba(16, 185, 129, 0.5);
  outline-offset: 1px;
}

.check-icon {
  stroke-width: 3;
}

.toggle-wrapper { display: flex; align-items: center; gap: 0.625rem; }

.toggle-btn {
  position: relative;
  width: 42px;
  height: 24px;
  border: none;
  border-radius: 999px;
  background: var(--border-color);
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle-btn.on { background: #10b981; }
.toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toggle-btn.on .toggle-thumb { transform: translateX(18px); }

.toggle-label { font-size: 0.875rem; color: var(--text-secondary); cursor: pointer; }

.radio-group { display: flex; flex-direction: column; gap: 0.5rem; }
.radio-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); cursor: pointer; }
.radio-input { accent-color: #10b981; width: 15px; height: 15px; cursor: pointer; }

.file-upload-container {
  width: 100%;
}

.hidden-file-input {
  display: none;
}

.file-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 1.5rem 1rem;
  background: var(--bg-surface-raised);
  border: 2px dashed var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.file-dropzone:hover {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.03);
}

.file-dropzone.dragging {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.08);
  transform: scale(1.01);
}

.file-dropzone.error {
  border-color: #ef4444;
}

.file-dropzone.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.dropzone-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #ecfdf5;
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

:root.dark .dropzone-icon,
.dark .dropzone-icon {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.file-dropzone:hover .dropzone-icon {
  transform: translateY(-2px);
}

.dropzone-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dropzone-prompt {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.dropzone-prompt strong {
  color: #10b981;
  font-weight: 600;
}

.dropzone-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* File selected preview card */
.file-preview-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-surface-raised);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  gap: 0.75rem;
  transition: border-color 0.15s;
}

.file-preview-card:hover {
  border-color: #10b981;
}

.file-preview-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
}

.file-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #ecfdf5;
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

:root.dark .file-icon-box,
.dark .file-icon-box {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.file-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.6875rem;
  color: var(--text-muted);
}

.file-remove-btn {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.file-remove-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

:root.dark .file-remove-btn:hover,
.dark .file-remove-btn:hover {
  background: rgba(220, 38, 38, 0.2);
  color: #f87171;
}

.field-error { font-size: 0.75rem; color: #ef4444; margin: 0; }
</style>
