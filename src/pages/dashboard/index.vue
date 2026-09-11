<template>
  <div>
    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back, {{ user?.name ?? 'User' }}! Here's what's happening.</p>
      </div>
      <button class="btn-primary-sm" @click="toast.success('Refreshed!', 'Done')">
        <RefreshCw :size="14" />
        Refresh
      </button>
    </div>
    
    <!-- Stats grid -->
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card card">
        <div class="stat-header">
          <span class="stat-label">{{ stat.label }}</span>
          <div class="stat-icon" :style="{ background: stat.iconBg, color: stat.iconColor }">
            <component :is="stat.icon" :size="16" />
          </div>
        </div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-trend" :class="stat.trend > 0 ? 'trend-up' : 'trend-down'">
          <TrendingUp v-if="stat.trend > 0" :size="12" />
          <TrendingDown v-else :size="12" />
          <span>{{ Math.abs(stat.trend) }}% from last month</span>
        </div>
      </div>
    </div>

    <!-- Content grid -->
    <div class="content-grid">
      <!-- Recent activity -->
      <div class="card activity-card">
        <div class="card-header">
          <h2 class="card-title">Recent Activity</h2>
          <a href="#" class="card-action">View all</a>
        </div>
        <div class="activity-list">
          <div v-for="item in activity" :key="item.id" class="activity-item">
            <div class="activity-avatar" :style="{ background: item.color }">
              {{ item.initials }}
            </div>
            <div class="activity-info">
              <p class="activity-text"><strong>{{ item.user }}</strong> {{ item.action }}</p>
              <p class="activity-time">{{ item.time }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="card quick-actions-card">
        <div class="card-header">
          <h2 class="card-title">Quick Actions</h2>
        </div>
        <div class="quick-actions">
          <button
            v-for="action in quickActions"
            :key="action.label"
            class="quick-action-btn"
            @click="toast.info(action.label + ' clicked')"
          >
            <span class="quick-action-icon" :style="{ background: action.bg, color: action.color }">
              <component :is="action.icon" :size="18" />
            </span>
            <span class="quick-action-label">{{ action.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  RefreshCw, TrendingDown, TrendingUp,
  Users, DollarSign, ShoppingCart, Activity,
  FileText, BarChart3, Settings
} from '@lucide/vue'
import { useAuth } from '@/core/composables/useAuth'
import { useToast } from '@/core/composables/useToast'

const { user } = useAuth()
const toast = useToast()

const stats = [
  { label: 'Total Revenue', value: '$45,231', trend: 20.1, icon: DollarSign, iconBg: '#ecfdf5', iconColor: '#059669' },
  { label: 'Active Users', value: '2,350', trend: 15.3, icon: Users, iconBg: '#eff6ff', iconColor: '#2563eb' },
  { label: 'New Orders', value: '1,247', trend: -4.5, icon: ShoppingCart, iconBg: '#fff7ed', iconColor: '#ea580c' },
  { label: 'Conversion Rate', value: '3.24%', trend: 8.2, icon: Activity, iconBg: '#faf5ff', iconColor: '#9333ea' },
]

const activity = [
  { id: 1, initials: 'JD', color: '#059669', user: 'John Doe', action: 'created a new project', time: '2 minutes ago' },
  { id: 2, initials: 'AS', color: '#2563eb', user: 'Amy Smith', action: 'updated user settings', time: '15 minutes ago' },
  { id: 3, initials: 'RK', color: '#9333ea', user: 'Ryan Kim', action: 'submitted a report', time: '1 hour ago' },
  { id: 4, initials: 'ML', color: '#ea580c', user: 'Maria Lee', action: 'invited 3 team members', time: '3 hours ago' },
]

const quickActions = [
  { label: 'New Report', icon: FileText, bg: '#ecfdf5', color: '#059669' },
  { label: 'Manage Users', icon: Users, bg: '#eff6ff', color: '#2563eb' },
  { label: 'Analytics', icon: BarChart3, bg: '#faf5ff', color: '#9333ea' },
  { label: 'Settings', icon: Settings, bg: '#f1f5f9', color: '#475569' },
]
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.page-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.btn-primary-sm {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  font-family: inherit;
  white-space: nowrap;
}
.btn-primary-sm:hover { opacity: 0.9; }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}

@media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr; } }

.stat-card {
  padding: 1.25rem;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.875rem;
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
}

.stat-value {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.375rem;
  letter-spacing: -0.02em;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.trend-up { color: #16a34a; }
.trend-down { color: #dc2626; }

/* Content grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
}

@media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }

.activity-card,
.quick-actions-card { padding: 1.25rem; }

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-action {
  font-size: 0.8125rem;
  color: #059669;
  text-decoration: none;
  font-weight: 500;
}

/* Activity list */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.activity-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.6875rem;
  font-weight: 700;
  flex-shrink: 0;
}

.activity-text {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0 0 0.125rem;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

/* Quick actions */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-surface-raised);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
  font-family: inherit;
}

.quick-action-btn:hover {
  background: var(--border-color);
  border-color: var(--text-muted);
  transform: translateY(-1px);
}

.quick-action-icon {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-action-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
}
</style>
