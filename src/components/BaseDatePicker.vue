<template>
  <div ref="containerRef" class="base-datepicker" :class="{ disabled }">
    <!-- NATIVE BROWSER PICKER (when native=true, ala Filament ->native(true)) -->
    <div v-if="native" class="native-picker-wrapper" :class="{ error: hasError, focused: isFocused }">
      <div class="picker-prefix-icon">
        <Calendar :size="16" />
      </div>
      <input
        :id="id"
        :value="modelValue"
        :type="type === 'datetime' ? 'datetime-local' : 'date'"
        class="native-date-input"
        :disabled="disabled"
        :min="minDate"
        :max="maxDate"
        @focus="isFocused = true"
        @blur="handleNativeBlur"
        @input="handleNativeInput"
      />
      <button
        v-if="clearable && modelValue && !disabled"
        type="button"
        class="picker-clear-btn"
        title="Clear date"
        @click.stop="clearDate"
      >
        <X :size="14" />
      </button>
    </div>

    <!-- CUSTOM CEPAT UI POPUP CALENDAR (Default, native=false) -->
    <div v-else class="custom-picker-container">
      <!-- Trigger Input Bar -->
      <div
        class="picker-trigger"
        :class="{
          open: isOpen || isMobileSheetOpen,
          error: hasError,
          disabled: disabled,
          'has-value': !!modelValue,
        }"
        tabindex="0"
        role="button"
        :aria-expanded="isOpen || isMobileSheetOpen"
        @click="toggleCalendar"
        @keydown.enter.prevent="toggleCalendar"
        @keydown.space.prevent="toggleCalendar"
        @keydown.esc.prevent="closeCalendar"
      >
        <div class="picker-prefix-icon">
          <Calendar :size="16" />
        </div>

        <span class="trigger-label" :class="{ placeholder: !modelValue }">
          {{ displayLabel }}
        </span>

        <div class="trigger-actions">
          <button
            v-if="clearable && modelValue && !disabled"
            type="button"
            class="picker-clear-btn"
            title="Clear date"
            @click.stop="clearDate"
          >
            <X :size="14" />
          </button>
          <ChevronDown
            :size="15"
            class="trigger-chevron"
            :class="{ rotated: isOpen || isMobileSheetOpen }"
          />
        </div>
      </div>

      <!-- DESKTOP POPOVER (only when !isMobile, teleported to body to prevent container clipping) -->
      <Teleport to="body">
        <Transition name="calendar-popover">
          <div
            v-if="isOpen && !isMobile"
            ref="popoverRef"
            class="calendar-popover"
            :class="`placement-${placement}`"
            :style="popoverStyle"
            role="dialog"
            aria-modal="true"
          >
          <!-- Calendar Header: Month/Year navigation -->
          <div class="calendar-header">
            <button
              type="button"
              class="nav-arrow-btn"
              title="Previous month"
              @click.stop="prevMonth"
            >
              <ChevronLeft :size="16" />
            </button>

            <div class="header-selectors">
              <!-- Month Selector -->
              <select
                v-model="viewMonth"
                class="header-select month-select"
                @click.stop
              >
                <option v-for="(mName, idx) in monthNames" :key="idx" :value="idx">
                  {{ mName }}
                </option>
              </select>

              <!-- Year Selector -->
              <select
                v-model="viewYear"
                class="header-select year-select"
                @click.stop
              >
                <option v-for="yr in yearOptions" :key="yr" :value="yr">
                  {{ yr }}
                </option>
              </select>
            </div>

            <button
              type="button"
              class="nav-arrow-btn"
              title="Next month"
              @click.stop="nextMonth"
            >
              <ChevronRight :size="16" />
            </button>
          </div>

          <!-- Weekdays Grid Header -->
          <div class="calendar-weekdays">
            <span v-for="day in weekDays" :key="day" class="weekday-cell">
              {{ day }}
            </span>
          </div>

          <!-- Days Matrix -->
          <div class="calendar-days-grid">
            <button
              v-for="(dayObj, idx) in calendarDays"
              :key="idx"
              type="button"
              class="day-cell"
              :class="{
                'other-month': !dayObj.currentMonth,
                today: dayObj.isToday,
                selected: dayObj.isSelected,
                disabled: dayObj.isDisabled,
              }"
              :disabled="dayObj.isDisabled"
              @click.stop="selectDate(dayObj)"
            >
              <span class="day-number">{{ dayObj.day }}</span>
              <span v-if="dayObj.isToday && !dayObj.isSelected" class="today-dot" />
            </button>
          </div>

          <!-- Time Picker (for datetime type) -->
          <div v-if="type === 'datetime'" class="time-picker-row">
            <div class="time-icon-label">
              <Clock :size="14" />
              <span>Time:</span>
            </div>
            <div class="time-inputs">
              <input
                v-model="timeHours"
                type="number"
                min="0"
                max="23"
                class="time-input"
                @change="updateTime"
                @click.stop
              />
              <span class="time-sep">:</span>
              <input
                v-model="timeMinutes"
                type="number"
                min="0"
                max="59"
                class="time-input"
                @change="updateTime"
                @click.stop
              />
            </div>
          </div>

          <!-- Calendar Footer Actions -->
          <div class="calendar-footer">
            <button
              type="button"
              class="footer-btn clear-btn"
              @click.stop="clearDate"
            >
              Clear
            </button>
            <div class="footer-actions-right">
              <button
                type="button"
                class="footer-btn today-btn"
                @click.stop="selectToday"
              >
                Today
              </button>
              <button
                type="button"
                class="footer-btn apply-btn"
                @click.stop="closeCalendar"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

      <!-- MOBILE BOTTOM SHEET (when isMobile) -->
      <BaseBottomSheet
        v-if="isMobile"
        v-model="isMobileSheetOpen"
        :title="type === 'datetime' ? 'Select Date & Time' : 'Select Date'"
        :subtitle="displayLabel"
        @close="closeCalendar"
      >
        <div class="calendar-mobile-content">
          <!-- Calendar Header: Month/Year navigation -->
          <div class="calendar-header">
            <button
              type="button"
              class="nav-arrow-btn mobile-arrow"
              title="Previous month"
              @click.stop="prevMonth"
            >
              <ChevronLeft :size="18" />
            </button>

            <div class="header-selectors">
              <!-- Month Selector -->
              <select
                v-model="viewMonth"
                class="header-select month-select mobile-select"
                @click.stop
              >
                <option v-for="(mName, idx) in monthNames" :key="idx" :value="idx">
                  {{ mName }}
                </option>
              </select>

              <!-- Year Selector -->
              <select
                v-model="viewYear"
                class="header-select year-select mobile-select"
                @click.stop
              >
                <option v-for="yr in yearOptions" :key="yr" :value="yr">
                  {{ yr }}
                </option>
              </select>
            </div>

            <button
              type="button"
              class="nav-arrow-btn mobile-arrow"
              title="Next month"
              @click.stop="nextMonth"
            >
              <ChevronRight :size="18" />
            </button>
          </div>

          <!-- Weekdays Grid Header -->
          <div class="calendar-weekdays">
            <span v-for="day in weekDays" :key="day" class="weekday-cell">
              {{ day }}
            </span>
          </div>

          <!-- Days Matrix (Full width on mobile) -->
          <div class="calendar-days-grid mobile-grid">
            <button
              v-for="(dayObj, idx) in calendarDays"
              :key="idx"
              type="button"
              class="day-cell mobile-day-cell"
              :class="{
                'other-month': !dayObj.currentMonth,
                today: dayObj.isToday,
                selected: dayObj.isSelected,
                disabled: dayObj.isDisabled,
              }"
              :disabled="dayObj.isDisabled"
              @click.stop="selectDate(dayObj)"
            >
              <span class="day-number">{{ dayObj.day }}</span>
              <span v-if="dayObj.isToday && !dayObj.isSelected" class="today-dot" />
            </button>
          </div>

          <!-- Time Picker (for datetime type) -->
          <div v-if="type === 'datetime'" class="time-picker-row">
            <div class="time-icon-label">
              <Clock :size="15" />
              <span>Time:</span>
            </div>
            <div class="time-inputs">
              <input
                v-model="timeHours"
                type="number"
                min="0"
                max="23"
                class="time-input"
                @change="updateTime"
                @click.stop
              />
              <span class="time-sep">:</span>
              <input
                v-model="timeMinutes"
                type="number"
                min="0"
                max="59"
                class="time-input"
                @change="updateTime"
                @click.stop
              />
            </div>
          </div>

          <!-- Calendar Footer Actions -->
          <div class="calendar-footer mobile-footer">
            <button
              type="button"
              class="footer-btn clear-btn mobile-btn"
              @click.stop="clearDate"
            >
              Clear
            </button>
            <div class="footer-actions-right">
              <button
                type="button"
                class="footer-btn today-btn mobile-btn"
                @click.stop="selectToday"
              >
                Today
              </button>
              <button
                type="button"
                class="footer-btn apply-btn mobile-btn"
                @click.stop="closeCalendar"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </BaseBottomSheet>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from '@lucide/vue'
import BaseBottomSheet from '@/components/BaseBottomSheet.vue'

interface Props {
  modelValue?: string | null
  id?: string
  native?: boolean
  type?: 'date' | 'datetime'
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  minDate?: string
  maxDate?: string
  hasError?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  native: false,
  type: 'date',
  placeholder: 'Select date...',
  disabled: false,
  clearable: true,
  hasError: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'blur'): void
}>()

// --- State ---
const containerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const isMobileSheetOpen = ref(false)
const isFocused = ref(false)
const isMobile = ref(false)

const placement = ref<'bottom' | 'top'>('bottom')
const popoverStyle = ref<{
  top?: string
  bottom?: string
  left: string
}>({ left: '0px' })

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())
const timeHours = ref('12')
const timeMinutes = ref('00')

// Check mobile breakpoint <= 640px
function checkMobile() {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth <= 640
  }
}

// --- Year Dropdown Options ---
const yearOptions = computed(() => {
  const current = new Date().getFullYear()
  const years: number[] = []
  for (let y = current - 80; y <= current + 20; y++) {
    years.push(y)
  }
  return years
})

// --- Parse initial date ---
function syncViewFromModel(val?: string | null) {
  if (!val) {
    viewYear.value = today.getFullYear()
    viewMonth.value = today.getMonth()
    timeHours.value = '12'
    timeMinutes.value = '00'
    return
  }

  const [datePart, timePart] = val.split('T')
  const [y, m] = datePart.split('-').map(Number)
  if (y && m) {
    viewYear.value = y
    viewMonth.value = m - 1
  }
  if (timePart) {
    const [hh, mm] = timePart.split(':')
    if (hh) timeHours.value = hh.padStart(2, '0')
    if (mm) timeMinutes.value = mm.padStart(2, '0')
  }
}

watch(() => props.modelValue, (newVal) => {
  syncViewFromModel(newVal)
}, { immediate: true })

// --- Formatted Display Label ---
const displayLabel = computed(() => {
  if (!props.modelValue) return props.placeholder

  const [datePart, timePart] = props.modelValue.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  if (!y || !m || !d) return props.modelValue

  const dateObj = new Date(y, m - 1, d)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  if (props.type === 'datetime' && timePart) {
    return `${formattedDate} ${timePart}`
  }
  return formattedDate
})

// --- Calendar Days Matrix Computation ---
interface DayItem {
  day: number
  month: number
  year: number
  currentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isDisabled: boolean
  dateString: string
}

const calendarDays = computed((): DayItem[] => {
  const year = viewYear.value
  const month = viewMonth.value

  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const items: DayItem[] = []

  // Selected date parts
  let selY: number | null = null
  let selM: number | null = null
  let selD: number | null = null
  if (props.modelValue) {
    const [dp] = props.modelValue.split('T')
    const [y, m, d] = dp.split('-').map(Number)
    selY = y
    selM = m - 1
    selD = d
  }

  // Today parts
  const todayY = today.getFullYear()
  const todayM = today.getMonth()
  const todayD = today.getDate()

  // 1. Previous month overflow days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const prevM = month === 0 ? 11 : month - 1
    const prevY = month === 0 ? year - 1 : year
    items.push({
      day: d,
      month: prevM,
      year: prevY,
      currentMonth: false,
      isToday: prevY === todayY && prevM === todayM && d === todayD,
      isSelected: prevY === selY && prevM === selM && d === selD,
      isDisabled: checkDisabled(prevY, prevM, d),
      dateString: toDateString(prevY, prevM, d),
    })
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    items.push({
      day: d,
      month,
      year,
      currentMonth: true,
      isToday: year === todayY && month === todayM && d === todayD,
      isSelected: year === selY && month === selM && d === selD,
      isDisabled: checkDisabled(year, month, d),
      dateString: toDateString(year, month, d),
    })
  }

  // 3. Next month overflow days (fill up to 42 cells = 6 rows)
  const remaining = 42 - items.length
  for (let d = 1; d <= remaining; d++) {
    const nextM = month === 11 ? 0 : month + 1
    const nextY = month === 11 ? year + 1 : year
    items.push({
      day: d,
      month: nextM,
      year: nextY,
      currentMonth: false,
      isToday: nextY === todayY && nextM === todayM && d === todayD,
      isSelected: nextY === selY && nextM === selM && d === selD,
      isDisabled: checkDisabled(nextY, nextM, d),
      dateString: toDateString(nextY, nextM, d),
    })
  }

  return items
})

function toDateString(y: number, m: number, d: number) {
  const mm = String(m + 1).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

function checkDisabled(y: number, m: number, d: number) {
  const dateStr = toDateString(y, m, d)
  if (props.minDate && dateStr < props.minDate) return true
  if (props.maxDate && dateStr > props.maxDate) return true
  return false
}

// --- Navigation ---
function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

function updatePopoverPosition() {
  if (!isOpen.value || isMobile.value || !containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const popoverWidth = 290
  const popoverHeight = 350
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const gap = 6

  // Auto-flip: If not enough room below (< 350px) and more room above, flip to top!
  if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
    placement.value = 'top'
    popoverStyle.value = {
      bottom: `${Math.round(window.innerHeight - rect.top + gap)}px`,
      left: `${computeLeft(rect.left, popoverWidth)}px`,
    }
  } else {
    placement.value = 'bottom'
    popoverStyle.value = {
      top: `${Math.round(rect.bottom + gap)}px`,
      left: `${computeLeft(rect.left, popoverWidth)}px`,
    }
  }
}

function computeLeft(triggerLeft: number, width: number): number {
  const padding = 12
  if (typeof window === 'undefined') return triggerLeft
  if (triggerLeft + width > window.innerWidth - padding) {
    return Math.max(padding, Math.round(window.innerWidth - width - padding))
  }
  return Math.max(padding, Math.round(triggerLeft))
}

function toggleCalendar() {
  if (props.disabled) return
  if (isMobile.value) {
    isMobileSheetOpen.value = !isMobileSheetOpen.value
  } else {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      nextTick(() => {
        updatePopoverPosition()
      })
    }
  }
}

function closeCalendar() {
  isOpen.value = false
  isMobileSheetOpen.value = false
  emit('blur')
}

// Track open state for dynamic positioning listeners
watch(isOpen, (open) => {
  if (open && !isMobile.value) {
    nextTick(() => updatePopoverPosition())
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleWindowResize)
  } else {
    window.removeEventListener('scroll', handleScroll, true)
    window.removeEventListener('resize', handleWindowResize)
  }
})

function handleScroll() {
  if (isOpen.value && !isMobile.value) {
    updatePopoverPosition()
  }
}

function handleWindowResize() {
  checkMobile()
  if (isOpen.value && !isMobile.value) {
    updatePopoverPosition()
  }
}

function selectDate(dayObj: DayItem) {
  if (dayObj.isDisabled) return

  let val = dayObj.dateString
  if (props.type === 'datetime') {
    const hh = String(Number(timeHours.value) || 0).padStart(2, '0')
    const mm = String(Number(timeMinutes.value) || 0).padStart(2, '0')
    val = `${val}T${hh}:${mm}`
  }

  emit('update:modelValue', val)
  emit('change', val)

  if (props.type === 'date' && !isMobile.value) {
    closeCalendar()
  }
}

function selectToday() {
  const d = today.getDate()
  const m = today.getMonth()
  const y = today.getFullYear()
  viewMonth.value = m
  viewYear.value = y

  selectDate({
    day: d,
    month: m,
    year: y,
    currentMonth: true,
    isToday: true,
    isSelected: true,
    isDisabled: false,
    dateString: toDateString(y, m, d),
  })
}

function updateTime() {
  if (!props.modelValue) return
  const [dp] = props.modelValue.split('T')
  const hh = String(Math.min(23, Math.max(0, Number(timeHours.value) || 0))).padStart(2, '0')
  const mm = String(Math.min(59, Math.max(0, Number(timeMinutes.value) || 0))).padStart(2, '0')
  timeHours.value = hh
  timeMinutes.value = mm
  const newVal = `${dp}T${hh}:${mm}`
  emit('update:modelValue', newVal)
  emit('change', newVal)
}

function clearDate() {
  emit('update:modelValue', '')
  emit('change', '')
  emit('blur')
}

// Native input events
function handleNativeInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('change', target.value)
}

function handleNativeBlur() {
  isFocused.value = false
  emit('blur')
}

// --- Click outside listener (desktop popover) ---
function handleClickOutside(event: MouseEvent) {
  if (isMobile.value || !isOpen.value) return
  const target = event.target as Node
  if (containerRef.value?.contains(target)) return
  if (popoverRef.value?.contains(target)) return
  closeCalendar()
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('resize', handleWindowResize)
  window.removeEventListener('scroll', handleScroll, true)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.base-datepicker {
  position: relative;
  width: 100%;
}

.base-datepicker.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Common input bar styles */
.picker-trigger,
.native-picker-wrapper {
  display: flex;
  align-items: center;
  height: 38px;
  padding: 0 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-surface);
  transition: all 0.15s ease;
  cursor: pointer;
  user-select: none;
  gap: 0.5rem;
}

.picker-trigger:hover:not(.disabled) {
  border-color: #10b981;
}

.picker-trigger.open,
.native-picker-wrapper.focused {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.picker-trigger.error,
.native-picker-wrapper.error {
  border-color: #ef4444;
}

.picker-prefix-icon {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.trigger-label {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trigger-label.placeholder {
  color: var(--text-muted);
}

.trigger-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.picker-clear-btn {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.picker-clear-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.trigger-chevron {
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.trigger-chevron.rotated {
  transform: rotate(180deg);
}

/* Native Input */
.native-date-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
}

/* Calendar Popover (Desktop) */
.calendar-popover {
  position: fixed;
  width: 290px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.16), 0 6px 12px -2px rgba(0, 0, 0, 0.08);
  padding: 0.875rem;
  z-index: 1050;
  user-select: none;
  box-sizing: border-box;
}

/* Mobile Content in Bottom Sheet */
.calendar-mobile-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 0.5rem;
}

.mobile-arrow {
  width: 36px;
  height: 36px;
}

.mobile-select {
  padding: 0.375rem 0.625rem;
  font-size: 0.875rem;
}

.mobile-grid {
  gap: 4px;
  margin-top: 0.25rem;
}

.mobile-day-cell {
  height: 42px;
  font-size: 0.9375rem;
  border-radius: 8px;
}

.mobile-footer {
  margin-top: 1rem;
  padding-top: 0.75rem;
}

.mobile-btn {
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
}

/* Calendar Header */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.header-selectors {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.header-select {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-surface-raised);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  outline: none;
}

.nav-arrow-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--bg-surface-raised);
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-arrow-btn:hover {
  background: #ecfdf5;
  color: #059669;
}

:root.dark .nav-arrow-btn:hover,
.dark .nav-arrow-btn:hover {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

/* Weekdays Grid */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 0.375rem;
}

.weekday-cell {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-muted);
  padding: 0.25rem 0;
  text-transform: uppercase;
}

/* Days Matrix */
.calendar-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-cell {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 7px;
  font-size: 0.8125rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.day-cell:hover:not(.disabled):not(.selected) {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.day-cell.other-month {
  opacity: 0.35;
}

.day-cell.today {
  font-weight: 700;
  color: #10b981;
}

.day-cell.selected {
  background: #10b981 !important;
  color: #ffffff !important;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.day-cell.disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.today-dot {
  position: absolute;
  bottom: 2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #10b981;
}

/* Time Picker Row */
.time-picker-row {
  margin-top: 0.625rem;
  padding-top: 0.625rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time-icon-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.time-input {
  width: 44px;
  height: 26px;
  text-align: center;
  font-size: 0.8125rem;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--bg-surface-raised);
  color: var(--text-primary);
  outline: none;
}

.time-input:focus {
  border-color: #10b981;
}

.time-sep {
  font-weight: 700;
  color: var(--text-muted);
}

/* Footer Actions */
.calendar-footer {
  margin-top: 0.75rem;
  padding-top: 0.625rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-actions-right {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.mobile-footer .footer-actions-right {
  gap: 0.5rem;
}

.footer-btn {
  border: none;
  background: transparent;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.footer-btn.clear-btn {
  color: var(--text-muted);
}
.footer-btn.clear-btn:hover {
  color: #dc2626;
  background: #fee2e2;
}

.footer-btn.today-btn {
  color: var(--text-secondary);
  background: var(--bg-surface-raised);
}
.footer-btn.today-btn:hover {
  color: var(--text-primary);
}

.footer-btn.apply-btn {
  background: #10b981;
  color: #ffffff;
}
.footer-btn.apply-btn:hover {
  background: #059669;
}

/* Popover Animation */
.calendar-popover-enter-active,
.calendar-popover-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.calendar-popover-enter-from,
.calendar-popover-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.calendar-popover.placement-top.calendar-popover-enter-from,
.calendar-popover.placement-top.calendar-popover-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
