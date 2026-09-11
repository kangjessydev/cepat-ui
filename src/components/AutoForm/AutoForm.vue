<template>
  <form class="auto-form" :class="`cols-${schema.columns ?? 1}`" novalidate @submit.prevent="handleSubmit">
    <template v-for="field in visibleFields" :key="field.name">
      <FormField
        :ref="(el) => { if (el) fieldRefs[field.name] = el as InstanceType<typeof FormField> }"
        :field="field"
        :model-value="values[field.name]"
        @update:model-value="values[field.name] = $event"
        @error="(name, err) => { fieldErrors[name] = err }"
      />
    </template>

    <!-- Hidden fields -->
    <template v-for="field in hiddenFields" :key="field.name">
      <input type="hidden" :name="field.name" :value="String(values[field.name] ?? '')" />
    </template>

    <!-- Actions slot or default -->
    <div :class="['form-actions', `actions-span-${schema.columns ?? 1}`]">
      <slot name="actions" :loading="loading" :submit="handleSubmit" :reset="handleReset">
        <button v-if="schema.cancelLabel" type="button" class="btn-cancel" @click="$emit('cancel')">
          {{ schema.cancelLabel }}
        </button>
        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner" />
          <span v-else>{{ schema.submitLabel ?? 'Save' }}</span>
        </button>
      </slot>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { FormSchema } from './types'
import FormField from './FormField.vue'

const props = withDefaults(defineProps<{
  schema: FormSchema
  modelValue?: Record<string, unknown>
  loading?: boolean
}>(), {
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [values: Record<string, unknown>]
  'submit': [values: Record<string, unknown>]
  'cancel': []
}>()

// Initialize values from modelValue or field defaults
const values = reactive<Record<string, unknown>>(
  Object.fromEntries(
    props.schema.fields.map(f => [f.name, props.modelValue?.[f.name] ?? f.default ?? ''])
  )
)

const fieldErrors = reactive<Record<string, string | null>>({})
const fieldRefs: Record<string, InstanceType<typeof FormField>> = {}

const visibleFields = computed(() =>
  props.schema.fields.filter(f =>
    f.type !== 'hidden' && (!f.showIf || f.showIf(values))
  )
)
const hiddenFields = computed(() =>
  props.schema.fields.filter(f => f.type === 'hidden')
)

// Sync to parent modelValue
watch(values, (v) => emit('update:modelValue', { ...v }), { deep: true })

// Sync from parent modelValue
watch(() => props.modelValue, (mv) => {
  if (mv) Object.assign(values, mv)
}, { deep: true })

async function handleSubmit() {
  // Validate all fields
  const results = await Promise.all(
    Object.values(fieldRefs).map(ref => ref.validate?.())
  )
  const hasErrors = results.some(r => r === false)
  if (hasErrors) return

  emit('submit', { ...values })
}

function handleReset() {
  props.schema.fields.forEach(f => {
    values[f.name] = f.default ?? ''
  })
}

defineExpose({ values, handleSubmit, handleReset })
</script>

<style scoped>
.auto-form {
  display: grid;
  gap: 1.125rem;
  width: 100%;
  min-width: 0;
}

.cols-1 { grid-template-columns: minmax(0, 1fr); }
.cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }

.actions-span-1 { grid-column: span 1; }
.actions-span-2 { grid-column: span 2; }
.actions-span-3 { grid-column: span 3; }

@media (max-width: 768px) {
  .auto-form,
  .cols-1,
  .cols-2,
  .cols-3 {
    grid-template-columns: minmax(0, 1fr) !important;
  }

  .actions-span-1,
  .actions-span-2,
  .actions-span-3,
  .form-actions {
    grid-column: span 1 !important;
  }
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.25rem;
}

.btn-cancel {
  height: 38px;
  padding: 0 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-cancel:hover { background: var(--border-color); }

.btn-submit {
  height: 38px;
  padding: 0 1.25rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.15s;
}
.btn-submit:hover:not(:disabled) { opacity: 0.9; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgb(255 255 255 / 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
