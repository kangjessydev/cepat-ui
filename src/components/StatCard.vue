<template>
  <div class="stat-card card">
    <div class="stat-header">
      <div class="stat-label-row">
        <span class="stat-label">{{ label }}</span>
        <div v-if="icon" class="stat-icon" :style="{ background: iconBg, color: iconColor }">
          <component :is="iconComponent" :size="15" />
        </div>
      </div>
    </div>

    <div class="stat-value">{{ value }}</div>

    <div v-if="trend !== undefined" class="stat-trend" :class="trend >= 0 ? 'trend-up' : 'trend-down'">
      <TrendingUp v-if="trend >= 0" :size="12" />
      <TrendingDown v-else :size="12" />
      <span>{{ Math.abs(trend) }}% {{ trendLabel }}</span>
    </div>

    <div v-if="description" class="stat-description">{{ description }}</div>

    <!-- Optional sparkline slot -->
    <div v-if="$slots.chart" class="stat-chart">
      <slot name="chart" />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as LucideIcons from '@lucide/vue'
import { TrendingDown, TrendingUp } from '@lucide/vue'
import type { Component } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  value: string | number
  trend?: number
  trendLabel?: string
  description?: string
  icon?: string
  iconBg?: string
  iconColor?: string
}>(), {
  trendLabel: 'from last month',
  iconBg: '#ecfdf5',
  iconColor: '#059669',
})

const iconComponent = computed((): Component | string => {
  if (!props.icon) return 'span'
  return (LucideIcons as unknown as Record<string, Component>)[props.icon] ?? 'span'
})
</script>

<style scoped>
.stat-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.stat-header { margin-bottom: 0.375rem; }

.stat-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
  line-height: 1;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.trend-up   { color: #16a34a; }
.trend-down { color: #dc2626; }

.stat-description {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.125rem;
}

.stat-chart {
  margin-top: 0.75rem;
}
</style>
