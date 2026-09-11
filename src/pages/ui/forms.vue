<template>
  <div class="showcase-container">
    <!-- Showcase Header -->
    <div class="page-header">
      <div class="header-titles">
        <div class="header-badge-group">
          <BaseBadge variant="primary" dot>Showcase</BaseBadge>
          <span class="version-tag">AutoForm System</span>
        </div>
        <h1 class="page-title">AutoForm & Dynamic Fields</h1>
        <p class="page-subtitle">
          Declarative, schema-driven forms with automatic validation, 12+ input types, multi-column grid layout, and real-time reactive state.
        </p>
      </div>

      <div class="header-cta">
        <router-link to="/ui/components">
          <BaseButton variant="outline">
            <template #icon>
              <Boxes :size="16" />
            </template>
            UI Components
          </BaseButton>
        </router-link>
      </div>
    </div>

    <!-- Alert banner -->
    <BaseAlert variant="info" title="Schema-Driven Architecture">
      With Cepat UI, you define your fields as a TypeScript schema object. <code>AutoForm</code> handles validation, grid layout, field masking, error states, and responsive styling automatically.
    </BaseAlert>

    <!-- Main 2-Column Showcase -->
    <div class="forms-showcase-grid">
      <!-- Left Column: AutoForm Playground -->
      <div class="form-column">
        <BaseCard title="Interactive Registration Form" subtitle="Fill out the fields to see live validation and reactive JSON synchronization">
          <AutoForm
            v-model="formValues"
            :schema="formSchema"
            :loading="submitting"
            @submit="handleSubmit"
            @cancel="handleReset"
          />
        </BaseCard>
      </div>

      <!-- Right Column: Live State & Schema Preview -->
      <div class="preview-column">
        <!-- Live JSON State Card -->
        <BaseCard title="Live Reactive State" subtitle="Two-way bound v-model output">
          <template #header-actions>
            <BaseBadge variant="success" dot>Reactive</BaseBadge>
          </template>

          <div class="state-header-bar">
            <span class="state-title-tag">Form Values (JSON)</span>
            <div class="state-btn-group">
              <BaseButton variant="ghost" size="sm" @click="handlePrefill">
                Prefill Sample
              </BaseButton>
              <BaseButton variant="outline" size="sm" @click="handleReset">
                Reset
              </BaseButton>
            </div>
          </div>

          <pre class="state-preview"><code>{{ formattedJson }}</code></pre>
        </BaseCard>

        <!-- Schema Code Snippet Card -->
        <BaseCard title="Schema Definition" subtitle="How this form is defined in TypeScript" variant="bordered">
          <pre class="schema-code"><code>const formSchema: FormSchema = {
  columns: 2,
  fields: [
    { name: 'name', type: 'text', required: true, span: 1 },
    { name: 'email', type: 'email', required: true, span: 1 },
    { name: 'password', type: 'password', required: true, span: 1 },
    { name: 'role', type: 'select', options: ['Admin', 'Editor', 'Viewer'] },
    { name: 'plan', type: 'radio', options: ['Starter', 'Pro', 'Enterprise'] },
    { name: 'agree', type: 'checkbox', required: true, span: 2 },
    // + 6 more field types supported out-of-the-box!
  ]
}</code></pre>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Boxes } from '@lucide/vue'
import { useToast } from '@/core/composables/useToast'
import type { FormSchema } from '@/components/AutoForm'

const toast = useToast()
const submitting = ref(false)

// Initial form state
const formValues = ref<Record<string, unknown>>({
  fullName: 'Sarah Connor',
  email: 'sarah@skynet.dev',
  password: '',
  age: 28,
  phone: '+62 812-3456-7890',
  website: 'https://cepat.dev',
  department: 'Engineering',
  plan: 'Pro',
  launchDate: '2026-10-15',
  deadlineNative: '2026-11-20',
  notes: 'Building next generation dashboard using Cepat UI starter.',
  terms: true,
})

// Complete Form Schema showcasing 12 field types
const formSchema: FormSchema = {
  columns: 2,
  submitLabel: 'Submit Registration',
  cancelLabel: 'Clear All',
  fields: [
    // 1. Text
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your full name',
      required: true,
      hint: 'Your official display name',
      span: 1,
    },
    // 2. Email
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'name@company.com',
      required: true,
      rules: [
        { type: 'required', message: 'Email address is required' },
        { type: 'email', message: 'Please enter a valid email format' },
      ],
      span: 1,
    },
    // 3. Password
    {
      name: 'password',
      label: 'Account Password',
      type: 'password',
      placeholder: '••••••••',
      required: true,
      rules: [
        { type: 'minLength', value: 6, message: 'Password must be at least 6 characters' },
      ],
      span: 1,
    },
    // 4. Number
    {
      name: 'age',
      label: 'Years of Experience',
      type: 'number',
      placeholder: 'e.g. 5',
      required: true,
      span: 1,
    },
    // 5. Tel
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+62 812-xxxx-xxxx',
      span: 1,
    },
    // 6. URL
    {
      name: 'website',
      label: 'Portfolio / Website',
      type: 'url',
      placeholder: 'https://example.com',
      span: 1,
    },
    // 7. Select
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      options: [
        { label: 'Engineering', value: 'Engineering' },
        { label: 'Product & Design', value: 'Product & Design' },
        { label: 'Marketing & Sales', value: 'Marketing & Sales' },
        { label: 'Operations & Finance', value: 'Operations & Finance' },
      ],
      required: true,
      span: 1,
    },
    // 8. Custom DatePicker (Default, native: false)
    {
      name: 'launchDate',
      label: 'Target Launch Date (Custom Picker)',
      type: 'date',
      hint: 'Custom Cepat UI popup calendar (native: false)',
      span: 1,
    },
    // 8b. Native DatePicker (Filament style, native: true)
    {
      name: 'deadlineNative',
      label: 'Deadline (Native Browser Picker)',
      type: 'date',
      native: true,
      hint: 'Native browser calendar / OS wheel (native: true)',
      span: 1,
    },
    // 9. Radio
    {
      name: 'plan',
      label: 'Subscription Tier',
      type: 'radio',
      options: [
        { label: 'Starter (Free)', value: 'Starter' },
        { label: 'Pro ($29/mo)', value: 'Pro' },
        { label: 'Enterprise (Custom)', value: 'Enterprise' },
      ],
      span: 2,
    },
    // 10. Textarea
    {
      name: 'notes',
      label: 'Project Summary / Bio',
      type: 'textarea',
      placeholder: 'Briefly describe your project requirements or team background...',
      span: 2,
    },
    // 11. File
    {
      name: 'attachment',
      label: 'Document Attachment (PDF or Image)',
      type: 'file',
      hint: 'Upload resume, portfolio, or requirements doc',
      span: 2,
    },
    // 12. Checkbox
    {
      name: 'terms',
      label: 'I accept the Terms of Service and Privacy Policy',
      type: 'checkbox',
      required: true,
      span: 2,
    },
  ],
}

// Live formatted JSON
const formattedJson = computed(() => {
  return JSON.stringify(formValues.value, null, 2)
})

function handleSubmit(values: Record<string, unknown>) {
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    toast.success(`Form submitted successfully for ${values.fullName ?? 'User'}!`)
  }, 800)
}

function handleReset() {
  formValues.value = {
    fullName: '',
    email: '',
    password: '',
    age: '',
    phone: '',
    website: '',
    department: '',
    plan: 'Starter',
    launchDate: '',
    deadlineNative: '',
    notes: '',
    terms: false,
  }
  toast.info('Form cleared')
}

function handlePrefill() {
  formValues.value = {
    fullName: 'Alex Morgan',
    email: 'alex.morgan@techcorp.io',
    password: 'SuperSecretPassword123!',
    age: 7,
    phone: '+1 (555) 234-5678',
    website: 'https://alexmorgan.dev',
    department: 'Product & Design',
    plan: 'Enterprise',
    launchDate: '2026-11-01',
    deadlineNative: '2026-12-15',
    notes: 'Migrating legacy dashboard into Cepat UI + Laravel Sanctum stack.',
    terms: true,
  }
  toast.success('Sample data loaded into form')
}
</script>

<style scoped>
.showcase-container {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  max-width: 1200px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-titles {
  display: flex;
  flex-direction: column;
}

.header-badge-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.version-tag {
  font-size: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--text-muted);
}

.header-cta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
  max-width: 680px;
}

.forms-showcase-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 1.5rem;
  align-items: start;
  width: 100%;
  min-width: 0;
}

@media (max-width: 1024px) {
  .forms-showcase-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.form-column {
  width: 100%;
  min-width: 0;
}

.preview-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 1.5rem;
  width: 100%;
  min-width: 0;
}

.state-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.state-title-tag {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.state-btn-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.state-preview {
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  line-height: 1.45;
  color: var(--text-primary);
  max-height: 280px;
  overflow-y: auto;
}

.schema-code {
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  line-height: 1.45;
  color: #10b981;
  overflow-x: auto;
}
:root.dark .schema-code,
.dark .schema-code {
  color: #34d399;
}
</style>
