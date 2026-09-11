<template>
  <div class="showcase-container">
    <!-- Showcase Header -->
    <div class="page-header">
      <div class="header-titles">
        <div class="header-badge-group">
          <BaseBadge variant="primary" dot>Showcase</BaseBadge>
          <span class="version-tag">v1.0.0</span>
        </div>
        <h1 class="page-title">UI Component Catalog</h1>
        <p class="page-subtitle">
          Interactive showcase of all Cepat UI design system primitives, variants, and interactive behaviors.
        </p>
      </div>

      <div class="header-cta">
        <router-link to="/ui/forms">
          <BaseButton variant="outline">
            <template #icon>
              <FormInput :size="16" />
            </template>
            AutoForm Showcase
          </BaseButton>
        </router-link>
      </div>
    </div>

    <!-- Quick Navigation Tabs -->
    <div class="tabs-wrapper">
      <BaseTabs v-model="activeSection" :items="sections" variant="pills" />
    </div>

    <!-- 1. BUTTONS SECTION -->
    <section v-show="activeSection === 'all' || activeSection === 'buttons'" class="section-block">
      <div class="section-header">
        <h2 class="section-title">Buttons</h2>
        <p class="section-desc">Interactive button primitives with distinct variants, sizes, and states.</p>
      </div>

      <div class="catalog-grid-2">
        <!-- Button Variants -->
        <BaseCard title="Variants" subtitle="5 core visual treatments for actions">
          <div class="btn-row">
            <BaseButton variant="primary">Primary</BaseButton>
            <BaseButton variant="secondary">Secondary</BaseButton>
            <BaseButton variant="outline">Outline</BaseButton>
            <BaseButton variant="ghost">Ghost</BaseButton>
            <BaseButton variant="danger">Danger</BaseButton>
          </div>
        </BaseCard>

        <!-- Button Sizes -->
        <BaseCard title="Sizes" subtitle="Small, Medium, and Large sizing scales">
          <div class="btn-row">
            <BaseButton variant="primary" size="sm">Small (sm)</BaseButton>
            <BaseButton variant="primary" size="md">Medium (md)</BaseButton>
            <BaseButton variant="primary" size="lg">Large (lg)</BaseButton>
          </div>
        </BaseCard>

        <!-- Button States -->
        <BaseCard title="States" subtitle="Disabled and interactive loading states">
          <div class="btn-row">
            <BaseButton variant="primary" disabled>Disabled</BaseButton>
            <BaseButton variant="outline" disabled>Disabled</BaseButton>
            <BaseButton variant="primary" :loading="btnLoading" @click="simulateLoading">
              {{ btnLoading ? 'Processing...' : 'Click to Load' }}
            </BaseButton>
            <BaseButton variant="danger" loading>Saving...</BaseButton>
          </div>
        </BaseCard>

        <!-- Button with Icons -->
        <BaseCard title="With Icons" subtitle="Prefix and suffix icon integration">
          <div class="btn-row">
            <BaseButton variant="primary">
              <template #icon>
                <Plus :size="16" />
              </template>
              Create Item
            </BaseButton>
            <BaseButton variant="secondary">
              <template #icon>
                <Download :size="16" />
              </template>
              Export
            </BaseButton>
            <BaseButton variant="outline">
              Settings
              <template #icon-right>
                <ChevronRight :size="16" />
              </template>
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </section>

    <!-- 2. BADGES SECTION -->
    <section v-show="activeSection === 'all' || activeSection === 'badges'" class="section-block">
      <div class="section-header">
        <h2 class="section-title">Badges</h2>
        <p class="section-desc">Pill indicators for status, categorisation, and meta annotations.</p>
      </div>

      <div class="catalog-grid-2">
        <BaseCard title="Standard Badges" subtitle="Default pill badge variants">
          <div class="badge-row">
            <BaseBadge variant="default">Default</BaseBadge>
            <BaseBadge variant="primary">Primary</BaseBadge>
            <BaseBadge variant="success">Success</BaseBadge>
            <BaseBadge variant="warning">Warning</BaseBadge>
            <BaseBadge variant="danger">Danger</BaseBadge>
          </div>
        </BaseCard>

        <BaseCard title="Dot Badges" subtitle="Status indicators with live dot indicator">
          <div class="badge-row">
            <BaseBadge variant="default" dot>Offline</BaseBadge>
            <BaseBadge variant="primary" dot>Active</BaseBadge>
            <BaseBadge variant="success" dot>Operational</BaseBadge>
            <BaseBadge variant="warning" dot>Degraded</BaseBadge>
            <BaseBadge variant="danger" dot>Outage</BaseBadge>
          </div>
        </BaseCard>
      </div>
    </section>

    <!-- 3. ALERTS SECTION -->
    <section v-show="activeSection === 'all' || activeSection === 'alerts'" class="section-block">
      <div class="section-header">
        <h2 class="section-title">Alerts & Banners</h2>
        <p class="section-desc">Contextual feedback messages for notifications and warnings.</p>
      </div>

      <div class="alert-list">
        <BaseAlert variant="info" title="Information Update" dismissible>
          A new version of Cepat UI (v1.0.0) is now active. All routes and menu definitions are automatically synchronized.
        </BaseAlert>

        <BaseAlert variant="success" title="Action Completed" dismissible>
          Your database connection has been established successfully. 12 sample records were seeded into memory.
        </BaseAlert>

        <BaseAlert variant="warning" title="API Notice" dismissible>
          You are currently using the in-memory Mock adapter. Run <code>npx cepat use:backend sanctum</code> to connect a real Laravel backend.
        </BaseAlert>

        <BaseAlert variant="danger" title="Security Warning" dismissible>
          Your API session token will expire in 15 minutes. Please verify your credentials to continue.
        </BaseAlert>
      </div>
    </section>

    <!-- 4. CARDS & STATS SECTION -->
    <section v-show="activeSection === 'all' || activeSection === 'cards'" class="section-block">
      <div class="section-header">
        <h2 class="section-title">Cards & Containers</h2>
        <p class="section-desc">Structural content containers with header actions and footers.</p>
      </div>

      <div class="catalog-grid-3 stats-row">
        <!-- StatCard Examples -->
        <StatCard
          label="Total Revenue"
          value="$48,250"
          :trend="12.5"
          trend-label="vs last month"
          icon="DollarSign"
          icon-bg="#ecfdf5"
          icon-color="#059669"
        />
        <StatCard
          label="Active Users"
          value="1,429"
          :trend="8.2"
          trend-label="vs last month"
          icon="Users"
          icon-bg="#eff6ff"
          icon-color="#2563eb"
        />
        <StatCard
          label="Pending Tickets"
          value="23"
          :trend="-4.1"
          trend-label="vs last week"
          icon="AlertCircle"
          icon-bg="#fef2f2"
          icon-color="#dc2626"
        />
      </div>

      <div class="catalog-grid-3">
        <!-- Card Default -->
        <BaseCard title="Default Card" subtitle="Standard border and subtle shadow">
          <p class="card-text">
            The standard card container with padding presets and auto-adapting dark mode borders.
          </p>
          <template #footer>
            <BaseButton variant="ghost" size="sm">Dismiss</BaseButton>
            <BaseButton variant="primary" size="sm">Learn More</BaseButton>
          </template>
        </BaseCard>

        <!-- Card Elevated -->
        <BaseCard variant="elevated" title="Elevated Card" subtitle="Soft elevation with shadow-md">
          <p class="card-text">
            Elevated cards provide higher visual hierarchy for featured metrics, summaries, or highlights.
          </p>
          <template #footer>
            <span class="card-timestamp">Updated 2m ago</span>
          </template>
        </BaseCard>

        <!-- Card Bordered with Actions -->
        <BaseCard variant="bordered" title="Bordered Card" subtitle="Emphasized border line">
          <template #header-actions>
            <BaseBadge variant="success">Pro</BaseBadge>
          </template>
          <p class="card-text">
            Card with custom header-action slot. Ideal for plan cards or settings cards.
          </p>
        </BaseCard>
      </div>
    </section>

    <!-- 5. TABS SECTION -->
    <section v-show="activeSection === 'all' || activeSection === 'tabs'" class="section-block">
      <div class="section-header">
        <h2 class="section-title">Tabs Navigation</h2>
        <p class="section-desc">Segmented controls with pills and underline variants.</p>
      </div>

      <div class="catalog-grid-2">
        <BaseCard title="Pills Style" subtitle="Segmented button tab style">
          <BaseTabs v-model="tabChoice" :items="sampleTabs" variant="pills" />
          <div class="tab-content-panel">
            Active tab: <strong>{{ tabChoice }}</strong>
          </div>
        </BaseCard>

        <BaseCard title="Underline Style" subtitle="Classic clean border-bottom tab style">
          <BaseTabs v-model="tabChoice" :items="sampleTabs" variant="underline" />
          <div class="tab-content-panel">
            Active tab: <strong>{{ tabChoice }}</strong>
          </div>
        </BaseCard>
      </div>
    </section>

    <!-- 6. MODALS & BOTTOMSHEET -->
    <section v-show="activeSection === 'all' || activeSection === 'modals'" class="section-block">
      <div class="section-header">
        <h2 class="section-title">Modals & BottomSheet</h2>
        <p class="section-desc">Accessible centered dialogs for desktop and dedicated slide-up BottomSheet for mobile.</p>
      </div>

      <BaseCard title="Modal & BottomSheet Triggers" subtitle="Click any button to preview dialogs and drawer sheets">
        <div class="btn-row">
          <BaseButton variant="outline" @click="openModal('sm')">Small Modal (sm)</BaseButton>
          <BaseButton variant="primary" @click="openModal('md')">Medium Modal (md)</BaseButton>
          <BaseButton variant="secondary" @click="openModal('lg')">Large Modal (lg)</BaseButton>
          <BaseButton variant="primary" @click="sheetOpen = true">
            <template #icon>
              <Layers :size="16" />
            </template>
            Trigger BottomSheet
          </BaseButton>
        </div>
      </BaseCard>

      <!-- Centered BaseModal -->
      <BaseModal
        v-model="modalOpen"
        :title="`${modalSize.toUpperCase()} Dialog Example`"
        :subtitle="`This is a ${modalSize} modal with customizable actions and keyboard navigation.`"
        :size="modalSize"
      >
        <p class="dialog-description">
          Modals automatically capture focus, close on Escape key or backdrop click, and support rich nested content including forms or data tables.
        </p>

        <template #footer>
          <BaseButton variant="secondary" @click="modalOpen = false">Cancel</BaseButton>
          <BaseButton variant="primary" @click="confirmModal">Confirm Action</BaseButton>
        </template>
      </BaseModal>

      <!-- BottomSheet Drawer -->
      <BaseBottomSheet
        v-model="sheetOpen"
        title="Mobile BottomSheet"
        subtitle="Swipe down or click backdrop to dismiss"
      >
        <p class="dialog-description">
          This BottomSheet slides up from the bottom of the screen with a grab handle indicator, touch swipe-down gesture support, and backdrop blur.
        </p>

        <div class="sheet-tip-box">
          <strong>Pro-Tip:</strong> Used automatically by <code>BaseDatePicker</code> on mobile screens (&le; 640px) to provide seamless thumb-friendly interaction!
        </div>

        <template #footer>
          <BaseButton variant="secondary" size="sm" @click="sheetOpen = false">Close</BaseButton>
          <BaseButton variant="primary" size="sm" @click="sheetOpen = false">Understood</BaseButton>
        </template>
      </BaseBottomSheet>
    </section>

    <!-- 7. TOAST NOTIFICATIONS -->
    <section v-show="activeSection === 'all' || activeSection === 'toasts'" class="section-block">
      <div class="section-header">
        <h2 class="section-title">Toast Notifications</h2>
        <p class="section-desc">Non-blocking floating toasts fired programmatically via <code>useToast()</code>.</p>
      </div>

      <BaseCard title="Fire Interactive Toasts" subtitle="Test animated toast popups at top-right">
        <div class="btn-row">
          <BaseButton variant="primary" @click="toast.success('Successfully saved changes!')">
            Success Toast
          </BaseButton>
          <BaseButton variant="danger" @click="toast.error('Network request failed. Please retry.')">
            Error Toast
          </BaseButton>
          <BaseButton variant="outline" @click="toast.warning('Your subscription is expiring soon.')">
            Warning Toast
          </BaseButton>
          <BaseButton variant="secondary" @click="toast.info('New message received from team.')">
            Info Toast
          </BaseButton>
        </div>
      </BaseCard>
    </section>

    <!-- 8. DATE & TIME PICKERS -->
    <section v-show="activeSection === 'all' || activeSection === 'datepicker'" class="section-block">
      <div class="section-header">
        <h2 class="section-title">Date & Time Pickers</h2>
        <p class="section-desc">Filament-style dual strategy: Custom Cepat popup calendar (default) or native browser wheel fallback (<code>native: true</code>).</p>
      </div>

      <div class="catalog-grid-2">
        <BaseCard title="Custom Cepat UI Calendar (Default)" subtitle="Popup calendar with month/year select, today, and clear">
          <div class="picker-demo-box">
            <BaseDatePicker v-model="demoDateCustom" placeholder="Select date..." />
            <span class="picker-value-label">
              Value: <code class="picker-code">{{ demoDateCustom || 'None' }}</code>
            </span>
          </div>
        </BaseCard>

        <BaseCard title="Native Browser Picker (native: true)" subtitle="Standard browser calendar input for OS-level wheels">
          <div class="picker-demo-box">
            <BaseDatePicker v-model="demoDateNative" native placeholder="Native picker..." />
            <span class="picker-value-label">
              Value: <code class="picker-code">{{ demoDateNative || 'None' }}</code>
            </span>
          </div>
        </BaseCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Plus,
  Download,
  ChevronRight,
  FormInput,
  Layers,
} from '@lucide/vue'
import { useToast } from '@/core/composables/useToast'
import type { TabItem } from '@/components/BaseTabs.vue'

const toast = useToast()

// Section navigation tabs
const activeSection = ref('all')
const sections: TabItem[] = [
  { key: 'all', label: 'All Components' },
  { key: 'buttons', label: 'Buttons' },
  { key: 'badges', label: 'Badges' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'cards', label: 'Cards & Stats' },
  { key: 'tabs', label: 'Tabs' },
  { key: 'modals', label: 'Modals' },
  { key: 'toasts', label: 'Toasts' },
  { key: 'datepicker', label: 'DatePickers' },
]

// DatePicker demo state
const demoDateCustom = ref('2026-10-15')
const demoDateNative = ref('2026-11-20')

// Button loading state simulation
const btnLoading = ref(false)
function simulateLoading() {
  btnLoading.value = true
  setTimeout(() => {
    btnLoading.value = false
    toast.success('Button task finished!')
  }, 1500)
}

// Tabs state
const tabChoice = ref('overview')
const sampleTabs: TabItem[] = [
  { key: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { key: 'activity', label: 'Activity', icon: 'Clock', badge: 5 },
  { key: 'billing', label: 'Billing', icon: 'CreditCard' },
  { key: 'disabled', label: 'Archived', disabled: true },
]

// Modal & BottomSheet state
const modalOpen = ref(false)
const sheetOpen = ref(false)
const modalSize = ref<'sm' | 'md' | 'lg'>('md')

function openModal(size: 'sm' | 'md' | 'lg') {
  modalSize.value = size
  modalOpen.value = true
}

function confirmModal() {
  modalOpen.value = false
  toast.success('Modal action confirmed!')
}
</script>

<style scoped>
.showcase-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
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
  gap: 0.25rem;
}

.header-badge-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.version-tag {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
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

.header-cta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tabs-wrapper {
  max-width: 100%;
  overflow-x: auto;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  margin-bottom: 0.25rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-desc {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin: 0.125rem 0 0;
}

/* Catalog Grids */
.catalog-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
  min-width: 0;
}

.catalog-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
  min-width: 0;
}

@media (max-width: 768px) {
  .catalog-grid-2,
  .catalog-grid-3 {
    grid-template-columns: minmax(0, 1fr);
  }
}

.stats-row {
  margin-bottom: 0.5rem;
}

/* Rows & Layouts */
.btn-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.card-timestamp {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.tab-content-panel {
  margin-top: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  background: var(--bg-surface-raised);
  border: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-primary);
}

.dialog-description {
  font-size: 0.875rem;
  color: var(--text-primary);
  opacity: 0.88;
  line-height: 1.55;
  margin: 0 0 1rem 0;
}

.sheet-tip-box {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  font-size: 0.8125rem;
  line-height: 1.45;
  margin-bottom: 1rem;
}

:root.dark .sheet-tip-box,
.dark .sheet-tip-box {
  background: rgba(6, 78, 59, 0.25);
  border-color: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

.picker-demo-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.picker-value-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.picker-code {
  color: #059669;
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

:root.dark .picker-code,
.dark .picker-code {
  color: #34d399;
}
</style>
