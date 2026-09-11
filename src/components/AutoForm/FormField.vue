<template>
  <div class="form-field-wrapper" :style="{ gridColumn: `span ${field.span ?? 1}` }">
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

    <!-- DATE / DATETIME -->
    <input
      v-else-if="['date','datetime'].includes(field.type)"
      :id="fieldId"
      v-model="internalValue"
      :type="field.type === 'datetime' ? 'datetime-local' : 'date'"
      class="field-input"
      :class="{ error: !!error }"
      :disabled="field.disabled"
      @blur="validate"
    />

    <!-- FILE -->
    <input
      v-else-if="field.type === 'file'"
      :id="fieldId"
      type="file"
      class="field-file"
      :class="{ error: !!error }"
      :disabled="field.disabled"
      @change="(e) => { internalValue = (e.target as HTMLInputElement).files?.[0] ?? null; validate() }"
    />

    <!-- Error message -->
    <p v-if="error" class="field-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { Check, Eye, EyeOff } from '@lucide/vue'
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

defineExpose({ validate })
</script>

<style scoped>
.form-field-wrapper { display: flex; flex-direction: column; gap: 0.375rem; }

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

.field-file {
  width: 100%;
  padding: 0.375rem 0;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.field-error { font-size: 0.75rem; color: #ef4444; margin: 0; }
</style>
