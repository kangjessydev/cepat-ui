<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Analytics</h1>
        <p class="page-subtitle">Track your key metrics and performance</p>
      </div>
      <div class="period-tabs">
        <button
          v-for="p in periods"
          :key="p"
          class="period-tab"
          :class="{ active: activePeriod === p }"
          @click="activePeriod = p"
        >{{ p }}</button>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="stats-grid">
      <StatCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :trend="stat.trend"
        :icon="stat.icon"
        :icon-bg="stat.iconBg"
        :icon-color="stat.iconColor"
      />
    </div>

    <!-- Charts row -->
    <div class="charts-row">
      <!-- Revenue chart (CSS bar chart) -->
      <div class="card chart-card">
        <div class="chart-header">
          <div>
            <h2 class="chart-title">Revenue Overview</h2>
            <p class="chart-subtitle">Monthly revenue for {{ activePeriod }}</p>
          </div>
          <BaseBadge variant="success">+12.5%</BaseBadge>
        </div>
        <div class="bar-chart">
          <div
            v-for="(bar, i) in barData"
            :key="i"
            class="bar-col"
          >
            <div class="bar-value">{{ bar.label }}</div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ height: bar.pct + '%' }" />
            </div>
            <div class="bar-month">{{ bar.month }}</div>
          </div>
        </div>
      </div>

      <!-- Traffic sources (donut-like) -->
      <div class="card chart-card">
        <div class="chart-header">
          <div>
            <h2 class="chart-title">Traffic Sources</h2>
            <p class="chart-subtitle">Where visitors come from</p>
          </div>
        </div>
        <div class="sources-list">
          <div v-for="src in sources" :key="src.label" class="source-item">
            <div class="source-left">
              <span class="source-dot" :style="{ background: src.color }" />
              <span class="source-label">{{ src.label }}</span>
            </div>
            <div class="source-right">
              <div class="source-bar-track">
                <div class="source-bar-fill" :style="{ width: src.pct + '%', background: src.color }" />
              </div>
              <span class="source-pct">{{ src.pct }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom: DataTable of top pages -->
    <div class="card" style="margin-top: 1.25rem">
      <div style="padding: 1.25rem 1.25rem 0; display:flex; justify-content:space-between; align-items:center">
        <h2 class="chart-title">Top Pages</h2>
        <BaseBadge variant="default">{{ activePeriod }}</BaseBadge>
      </div>
      <DataTable
        :data="topPages"
        :columns="pageColumns"
        style="border: none; border-radius: 0; box-shadow: none"
      >
        <template #cell-change="{ value }">
          <span :style="{ color: (value as number) >= 0 ? '#16a34a' : '#dc2626', fontWeight: '500', fontSize: '0.8125rem' }">
            {{ (value as number) >= 0 ? '+' : '' }}{{ value }}%
          </span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DataTable } from '@/components/DataTable'
import type { DataTableColumn } from '@/components/DataTable'

const activePeriod = ref('Last 30 days')
const periods = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last year']

const stats = [
  { label: 'Total Visitors', value: '84,302', trend: 14.2, icon: 'Users', iconBg: '#eff6ff', iconColor: '#2563eb' },
  { label: 'Page Views', value: '312,841', trend: 8.7, icon: 'Eye', iconBg: '#faf5ff', iconColor: '#9333ea' },
  { label: 'Bounce Rate', value: '34.2%', trend: -3.1, icon: 'TrendingDown', iconBg: '#fff7ed', iconColor: '#ea580c' },
  { label: 'Avg. Session', value: '3m 42s', trend: 5.4, icon: 'Clock', iconBg: '#ecfdf5', iconColor: '#059669' },
]

const barData = [
  { month: 'Jan', label: '$12k', pct: 55 },
  { month: 'Feb', label: '$18k', pct: 75 },
  { month: 'Mar', label: '$14k', pct: 60 },
  { month: 'Apr', label: '$22k', pct: 90 },
  { month: 'May', label: '$19k', pct: 78 },
  { month: 'Jun', label: '$25k', pct: 100 },
  { month: 'Jul', label: '$21k', pct: 85 },
]

const sources = [
  { label: 'Organic Search', pct: 42, color: '#10b981' },
  { label: 'Direct', pct: 25, color: '#2563eb' },
  { label: 'Social Media', pct: 18, color: '#9333ea' },
  { label: 'Referral', pct: 10, color: '#f59e0b' },
  { label: 'Email', pct: 5, color: '#ef4444' },
]

const topPages = [
  { page: '/dashboard', views: 24803, unique: 18920, change: 12.3 },
  { page: '/products', views: 18432, unique: 14201, change: -2.1 },
  { page: '/about', views: 9821, unique: 8012, change: 5.8 },
  { page: '/pricing', views: 7643, unique: 6810, change: 18.4 },
  { page: '/blog', views: 6201, unique: 5430, change: -8.2 },
]

const pageColumns: DataTableColumn<typeof topPages[0]>[] = [
  { key: 'page', label: 'Page', sortable: true },
  { key: 'views', label: 'Views', sortable: true, align: 'right', format: (v) => Number(v).toLocaleString() },
  { key: 'unique', label: 'Unique', sortable: true, align: 'right', format: (v) => Number(v).toLocaleString() },
  { key: 'change', label: 'Change', sortable: true, align: 'right' },
]
</script>

<style scoped>
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap;
}
.page-title { font-size: 1.375rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; }
.page-subtitle { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }

.period-tabs {
  display: flex; gap: 0.25rem; background: var(--bg-surface-raised);
  border: 1px solid var(--border-color); border-radius: 8px; padding: 0.25rem;
}
.period-tab {
  padding: 0.375rem 0.75rem; border: none; border-radius: 6px; background: transparent;
  color: var(--text-secondary); font-size: 0.8125rem; font-weight: 500; cursor: pointer;
  font-family: inherit; transition: background 0.15s, color 0.15s;
}
.period-tab.active { background: var(--bg-surface); color: var(--text-primary); box-shadow: var(--shadow-sm); }

.stats-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.25rem;
}
@media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr; } }

.charts-row { display: grid; grid-template-columns: 1fr 340px; gap: 1rem; }
@media (max-width: 1024px) { .charts-row { grid-template-columns: 1fr; } }

.chart-card { padding: 1.25rem; }

.chart-header {
  display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.25rem;
}
.chart-title { font-size: 0.9375rem; font-weight: 600; color: var(--text-primary); margin: 0 0 0.25rem; }
.chart-subtitle { font-size: 0.8125rem; color: var(--text-secondary); margin: 0; }

/* Bar chart */
.bar-chart {
  display: flex; align-items: flex-end; gap: 0.5rem; height: 160px;
}

.bar-col {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.375rem; flex: 1;
}

.bar-value {
  font-size: 0.6875rem; font-weight: 600; color: var(--text-muted);
}

.bar-track {
  flex: 1; width: 100%; background: var(--bg-surface-raised);
  border-radius: 4px; display: flex; align-items: flex-end; overflow: hidden;
}

.bar-fill {
  width: 100%; background: linear-gradient(to top, #059669, #34d399);
  border-radius: 4px; transition: height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 4px;
}

.bar-month {
  font-size: 0.6875rem; color: var(--text-muted);
}

/* Sources */
.sources-list { display: flex; flex-direction: column; gap: 1rem; }

.source-item { display: flex; flex-direction: column; gap: 0.375rem; }

.source-left { display: flex; align-items: center; gap: 0.5rem; }

.source-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.source-label { font-size: 0.875rem; color: var(--text-secondary); flex: 1; }

.source-right { display: flex; align-items: center; gap: 0.625rem; }

.source-bar-track {
  flex: 1; height: 6px; background: var(--bg-surface-raised); border-radius: 999px; overflow: hidden;
}

.source-bar-fill {
  height: 100%; border-radius: 999px; transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.source-pct { font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); width: 36px; text-align: right; }
</style>
