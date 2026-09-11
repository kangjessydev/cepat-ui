#!/usr/bin/env node

/**
 * Cepat UI CLI — Developer Experience Tooling
 *
 * Fast code generator for pages, full CRUD resources, components, and auth adapters.
 * Automates route registration and sidebar navigation items.
 *
 * Usage:
 *   npx cepat make:page <Name> [options]
 *   npx cepat make:crud <Name> [options]
 *   npx cepat make:component <Name>
 *   npx cepat make:adapter <Name>
 *   npx cepat list:routes
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

// --- ANSI Colors ---
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
}

const banner = `
${c.cyan}${c.bold}   ___ ___ ___  _ _____   _   _ ___ 
  / __| __| _ \\/_\\_   _| | | | |_ _|
 | (__| _||  _/ _ \\| |   | |_| || | 
  \\___|___|_|/_/ \\_\\_|    \\___/|___|${c.reset}
  ${c.dim}Cepat UI DX Generator v0.1.0${c.reset}
`

// --- Argument parser ---
function parseArgs(args) {
  const parsed = { _: [], options: {} }
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, ...valParts] = arg.slice(2).split('=')
      const value = valParts.length > 0 ? valParts.join('=') : true
      parsed.options[key] = value
    } else {
      parsed._.push(arg)
    }
  }
  return parsed
}

// --- String helpers ---
function toPascalCase(str) {
  return str
    .replace(/[-_ ]+(\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, c => c.toUpperCase())
}

function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

function toTitleCase(str) {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

// --- File helpers ---
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function registerRoute({ routePath, routeName, componentPath, title, roles }) {
  const routerFile = path.join(ROOT, 'src/core/router/index.ts')
  if (!fs.existsSync(routerFile)) return false

  let content = fs.readFileSync(routerFile, 'utf-8')
  if (content.includes(`path: '${routePath}'`)) {
    console.log(`  ${c.yellow}⚠ Route '${routePath}' already registered in router/index.ts${c.reset}`)
    return false
  }

  const roleMeta = roles && roles.length > 0 ? `, roles: [${roles.map(r => `'${r}'`).join(', ')}]` : ''
  const newRouteEntry = `    {
      path: '${routePath}',
      name: '${routeName}',
      component: () => import('${componentPath}'),
      meta: { layout: 'dashboard', requiresAuth: true, title: '${title}'${roleMeta} },
    },
`

  // Insert right before '// 404'
  const marker = '// 404'
  if (content.includes(marker)) {
    content = content.replace(marker, `${newRouteEntry}    ${marker}`)
    fs.writeFileSync(routerFile, content, 'utf-8')
    console.log(`  ${c.green}✓ Added route to ${c.bold}src/core/router/index.ts${c.reset}`)
    return true
  }
  return false
}

function registerNavigation({ title, icon, route, roles, parent }) {
  const navFile = path.join(ROOT, 'src/core/router/navigation.ts')
  if (!fs.existsSync(navFile)) return false

  let content = fs.readFileSync(navFile, 'utf-8')
  if (content.includes(`route: '${route}'`)) {
    console.log(`  ${c.yellow}⚠ Navigation item for '${route}' already exists in navigation.ts${c.reset}`)
    return false
  }

  const roleEntry = roles && roles.length > 0 ? `,\n    roles: [${roles.map(r => `'${r}'`).join(', ')}]` : ''

  if (parent) {
    // Attempt to nest inside existing parent group
    const parentRegex = new RegExp(`title:\\s*['"]${parent}['"][\\s\\S]*?children:\\s*\\[`, 'i')
    if (parentRegex.test(content)) {
      const childEntry = `\n      {
        title: '${title}',
        icon: '${icon}',
        route: '${route}',
      },`
      content = content.replace(parentRegex, match => match + childEntry)
      fs.writeFileSync(navFile, content, 'utf-8')
      console.log(`  ${c.green}✓ Added menu item under '${parent}' in ${c.bold}src/core/router/navigation.ts${c.reset}`)
      return true
    }
  }

  // Insert before the closing array bracket ']'
  const newNavItem = `  {
    title: '${title}',
    icon: '${icon}',
    route: '${route}'${roleEntry},
  },
`
  const lastBracket = content.lastIndexOf(']')
  if (lastBracket !== -1) {
    content = content.slice(0, lastBracket) + newNavItem + content.slice(lastBracket)
    fs.writeFileSync(navFile, content, 'utf-8')
    console.log(`  ${c.green}✓ Added sidebar menu in ${c.bold}src/core/router/navigation.ts${c.reset}`)
    return true
  }
  return false
}

// --- Commands ---

function makePage(name, options) {
  if (!name) {
    console.error(`${c.red}Error: Page name is required.${c.reset} Example: cepat make:page Customers`)
    process.exit(1)
  }

  const kebabName = toKebabCase(name)
  const pascalName = toPascalCase(name)
  const title = options.title || toTitleCase(name)
  const routePath = options.route || `/${kebabName}`
  const icon = options.icon || 'FileText'
  const roles = options.roles ? options.roles.split(',').map(r => r.trim()) : []
  const force = !!options.force
  const noNav = !!options['no-nav']

  const targetDir = path.join(ROOT, 'src/pages', kebabName)
  const targetFile = path.join(targetDir, 'index.vue')

  if (fs.existsSync(targetFile) && !force) {
    console.error(`${c.red}Error: Page already exists at ${targetFile}.${c.reset} Use --force to overwrite.`)
    process.exit(1)
  }

  ensureDir(targetDir)

  const template = `<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">${title}</h1>
        <p class="page-subtitle">Manage and overview your ${title.toLowerCase()}</p>
      </div>
      <div class="header-actions">
        <BaseButton variant="primary" @click="handleAction">
          Action
        </BaseButton>
      </div>
    </div>

    <!-- Content Card -->
    <div class="card p-6">
      <h2 class="text-base font-semibold text-slate-900 dark:text-white mb-2">Content</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        This is the starter template for <strong>${title}</strong>. Start adding your components here.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/core/composables/useToast'

const toast = useToast()

function handleAction() {
  toast.success('Action clicked on ${title} page')
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.page-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--color-gray-500);
  margin: 0.25rem 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
</style>
`

  fs.writeFileSync(targetFile, template, 'utf-8')
  console.log(`\n${c.green}${c.bold}🎉 Page created successfully!${c.reset}`)
  console.log(`  ${c.cyan}File:${c.reset} src/pages/${kebabName}/index.vue`)

  // Register router
  registerRoute({
    routePath,
    routeName: kebabName,
    componentPath: `@/pages/${kebabName}/index.vue`,
    title,
    roles,
  })

  // Register navigation
  if (!noNav) {
    registerNavigation({
      title,
      icon,
      route: routePath,
      roles,
      parent: options.parent,
    })
  }

  console.log(`\n${c.dim}Visit at: http://localhost:5173${routePath}${c.reset}\n`)
}

function makeCrud(name, options) {
  if (!name) {
    console.error(`${c.red}Error: Resource name is required.${c.reset} Example: cepat make:crud Products`)
    process.exit(1)
  }

  const kebabName = toKebabCase(name)
  const pascalName = toPascalCase(name)
  const title = options.title || toTitleCase(name)
  const routePath = options.route || `/${kebabName}`
  const icon = options.icon || 'Package'
  const roles = options.roles ? options.roles.split(',').map(r => r.trim()) : []
  const force = !!options.force
  const noNav = !!options['no-nav']

  // Parse fields option: --fields=name:text,price:number,category:select,status:select
  // Default fields if none provided
  const rawFields = options.fields
    ? options.fields.split(',').map(f => {
        const [fname, ftype] = f.split(':')
        return { name: fname.trim(), type: ftype ? ftype.trim() : 'text' }
      })
    : [
        { name: 'name', type: 'text' },
        { name: 'category', type: 'select' },
        { name: 'status', type: 'select' },
      ]

  const targetDir = path.join(ROOT, 'src/pages', kebabName)
  const targetFile = path.join(targetDir, 'index.vue')

  if (fs.existsSync(targetFile) && !force) {
    console.error(`${c.red}Error: Resource already exists at ${targetFile}.${c.reset} Use --force to overwrite.`)
    process.exit(1)
  }

  ensureDir(targetDir)

  // Build schema fields
  const schemaFieldsCode = rawFields.map(f => {
    if (f.type === 'select') {
      return `    {
      name: '${f.name}',
      label: '${toTitleCase(f.name)}',
      type: 'select',
      options: ['Active', 'Pending', 'Archived'],
      required: true,
    },`
    }
    if (f.type === 'number') {
      return `    {
      name: '${f.name}',
      label: '${toTitleCase(f.name)}',
      type: 'number',
      required: true,
    },`
    }
    return `    {
      name: '${f.name}',
      label: '${toTitleCase(f.name)}',
      type: '${f.type}',
      placeholder: 'Enter ${f.name}...',
      required: true,
    },`
  }).join('\n')

  // Build columns
  const columnsCode = rawFields.map(f => {
    return `  { key: '${f.name}', label: '${toTitleCase(f.name)}', sortable: true },`
  }).join('\n')

  // Build mock items
  const mockItem1 = rawFields.reduce((acc, f) => {
    acc[f.name] = f.type === 'number' ? 120 : (f.type === 'select' ? 'Active' : `Sample ${f.name} 1`)
    return acc
  }, { id: 1 })

  const mockItem2 = rawFields.reduce((acc, f) => {
    acc[f.name] = f.type === 'number' ? 250 : (f.type === 'select' ? 'Pending' : `Sample ${f.name} 2`)
    return acc
  }, { id: 2 })

  const template = `<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">${title}</h1>
        <p class="page-subtitle">Manage, filter, and inspect your ${title.toLowerCase()}</p>
      </div>
      <BaseButton variant="primary" @click="openCreateModal">
        <template #icon>
          <Plus :size="16" />
        </template>
        Add ${pascalName}
      </BaseButton>
    </div>

    <!-- Data Table -->
    <DataTable
      :columns="columns"
      :data="items"
      :actions="actions"
      :bulk-actions="bulkActions"
      selectable
      search-placeholder="Search ${title.toLowerCase()}..."
    >
      <!-- Custom status cell -->
      <template #cell-status="{ value }">
        <BaseBadge
          :variant="value === 'Active' ? 'success' : value === 'Pending' ? 'warning' : 'default'"
          dot
        >
          {{ value }}
        </BaseBadge>
      </template>
    </DataTable>

    <!-- Create / Edit Modal -->
    <BaseModal
      v-model="modalOpen"
      :title="editingItem ? 'Edit ${pascalName}' : 'Add New ${pascalName}'"
      :subtitle="editingItem ? 'Update details below' : 'Fill in the details below'"
      size="md"
    >
      <AutoForm
        :schema="formSchema"
        :initial-values="editingItem ?? {}"
        :submit-label="editingItem ? 'Save Changes' : 'Create ${pascalName}'"
        @submit="handleSubmit"
        @cancel="modalOpen = false"
      />
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal
      v-model="deleteModalOpen"
      title="Delete ${pascalName}"
      subtitle="Are you sure you want to delete this record? This action cannot be undone."
      size="sm"
    >
      <div class="flex justify-end gap-2 pt-2">
        <BaseButton variant="secondary" @click="deleteModalOpen = false">
          Cancel
        </BaseButton>
        <BaseButton variant="danger" @click="confirmDelete">
          Delete
        </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@lucide/vue'
import type { DataTableColumn, DataTableAction } from '@/components/DataTable'
import type { FormSchema } from '@/components/AutoForm'
import { useToast } from '@/core/composables/useToast'

const toast = useToast()

interface ${pascalName}Item extends Record<string, unknown> {
  id: number
${rawFields.map(f => `  ${f.name}: ${f.type === 'number' ? 'number' : 'string'}`).join('\n')}
}

// Table columns
const columns: DataTableColumn<${pascalName}Item>[] = [
${columnsCode}
]

// Mock data
const items = ref<${pascalName}Item[]>([
  ${JSON.stringify(mockItem1, null, 2).replace(/\n/g, '\n  ')},
  ${JSON.stringify(mockItem2, null, 2).replace(/\n/g, '\n  ')},
])

// Form Schema for AutoForm
const formSchema: FormSchema = {
  columns: 1,
  fields: [
${schemaFieldsCode}
  ],
}

// Modal state
const modalOpen = ref(false)
const deleteModalOpen = ref(false)
const editingItem = ref<${pascalName}Item | null>(null)
const itemToDelete = ref<${pascalName}Item | null>(null)

function openCreateModal() {
  editingItem.value = null
  modalOpen.value = true
}

function openEditModal(item: ${pascalName}Item) {
  editingItem.value = { ...item }
  modalOpen.value = true
}

function openDeleteModal(item: ${pascalName}Item) {
  itemToDelete.value = item
  deleteModalOpen.value = true
}

function handleSubmit(values: Record<string, unknown>) {
  if (editingItem.value) {
    const idx = items.value.findIndex(i => i.id === editingItem.value!.id)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...values } as ${pascalName}Item
      toast.success('${pascalName} updated successfully')
    }
  } else {
    const newItem: ${pascalName}Item = {
      id: Date.now(),
      ...values,
    } as ${pascalName}Item
    items.value.unshift(newItem)
    toast.success('New ${pascalName.toLowerCase()} created successfully')
  }
  modalOpen.value = false
}

function confirmDelete() {
  if (itemToDelete.value) {
    items.value = items.value.filter(i => i.id !== itemToDelete.value!.id)
    toast.success('${pascalName} deleted')
  }
  deleteModalOpen.value = false
}

// Row actions
const actions: DataTableAction<${pascalName}Item>[] = [
  { label: 'Edit', icon: 'Pencil', onClick: openEditModal },
  { label: 'Delete', icon: 'Trash2', variant: 'danger', onClick: openDeleteModal },
]

// Bulk actions
const bulkActions = [
  {
    label: 'Delete Selected',
    variant: 'danger' as const,
    onClick: (selected: ${pascalName}Item[]) => {
      items.value = items.value.filter(i => !selected.some(s => s.id === i.id))
      toast.success(\`\${selected.length} items deleted\`)
    },
  },
]
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.page-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--color-gray-500);
  margin: 0.25rem 0 0;
}
</style>
`

  fs.writeFileSync(targetFile, template, 'utf-8')
  console.log(`\n${c.green}${c.bold}🎉 Full CRUD Resource '${title}' created successfully!${c.reset}`)
  console.log(`  ${c.cyan}File:${c.reset} src/pages/${kebabName}/index.vue`)
  console.log(`  ${c.dim}Features included: DataTable, AutoForm modal, Create/Edit/Delete, Search, Sort, Pagination, Bulk Actions.${c.reset}`)

  // Register router
  registerRoute({
    routePath,
    routeName: kebabName,
    componentPath: `@/pages/${kebabName}/index.vue`,
    title,
    roles,
  })

  // Register navigation
  if (!noNav) {
    registerNavigation({
      title,
      icon,
      route: routePath,
      roles,
      parent: options.parent,
    })
  }

  console.log(`\n${c.dim}Visit at: http://localhost:5173${routePath}${c.reset}\n`)
}

function makeComponent(name, options) {
  if (!name) {
    console.error(`${c.red}Error: Component name is required.${c.reset} Example: cepat make:component UserCard`)
    process.exit(1)
  }

  const pascalName = toPascalCase(name)
  const targetFile = path.join(ROOT, 'src/components', `${pascalName}.vue`)

  if (fs.existsSync(targetFile) && !options.force) {
    console.error(`${c.red}Error: Component already exists at ${targetFile}.${c.reset} Use --force to overwrite.`)
    process.exit(1)
  }

  const template = `<template>
  <div class="${toKebabCase(name)}">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'primary'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<style scoped>
.${toKebabCase(name)} {
  /* Component styles */
}
</style>
`

  fs.writeFileSync(targetFile, template, 'utf-8')
  console.log(`\n${c.green}${c.bold}✓ Component created:${c.reset} src/components/${pascalName}.vue\n`)
}

function makeAdapter(name, options) {
  if (!name) {
    console.error(`${c.red}Error: Adapter name is required.${c.reset} Example: cepat make:adapter supabase`)
    process.exit(1)
  }

  const kebabName = toKebabCase(name)
  const pascalName = toPascalCase(name)
  const targetFile = path.join(ROOT, 'src/core/auth', `${kebabName}.adapter.ts`)

  if (fs.existsSync(targetFile) && !options.force) {
    console.error(`${c.red}Error: Adapter already exists at ${targetFile}.${c.reset} Use --force to overwrite.`)
    process.exit(1)
  }

  const template = `// src/core/auth/${kebabName}.adapter.ts
import type { AuthAdapter, AuthResponse, LoginPayload, RegisterPayload, User } from './types'

/**
 * ${pascalName} Auth Adapter
 * Implement your authentication logic here and activate it in src/plugins/auth.ts
 */
export class ${pascalName}AuthAdapter implements AuthAdapter {
  readonly name = '${kebabName}'

  async login(payload: LoginPayload): Promise<AuthResponse> {
    // TODO: Implement login with ${pascalName}
    throw new Error('Method not implemented.')
  }

  async logout(): Promise<void> {
    // TODO: Implement logout
  }

  async getUser(): Promise<User | null> {
    // TODO: Fetch authenticated user
    return null
  }

  async register?(payload: RegisterPayload): Promise<AuthResponse> {
    // TODO: Optional register implementation
    throw new Error('Method not implemented.')
  }
}

export const ${kebabName}AuthAdapter = new ${pascalName}AuthAdapter()
`

  fs.writeFileSync(targetFile, template, 'utf-8')
  console.log(`\n${c.green}${c.bold}✓ Auth adapter created:${c.reset} src/core/auth/${kebabName}.adapter.ts`)
  console.log(`  ${c.dim}To activate, import in src/plugins/auth.ts and set as authAdapter.${c.reset}\n`)
}

function listRoutes() {
  const routerFile = path.join(ROOT, 'src/core/router/index.ts')
  const navFile = path.join(ROOT, 'src/core/router/navigation.ts')

  console.log(`\n${c.bold}=== Registered Routes & Menu Items ===${c.reset}\n`)

  if (fs.existsSync(navFile)) {
    const navContent = fs.readFileSync(navFile, 'utf-8')
    const matches = navContent.matchAll(/title:\s*['"]([^'"]+)['"][\s\S]*?route:\s*['"]([^'"]+)['"]/g)
    console.log(`${c.cyan}${c.bold}Sidebar Navigation Items:${c.reset}`)
    for (const match of matches) {
      console.log(`  • ${c.green}${match[1].padEnd(20)}${c.reset} ${c.dim}→${c.reset} ${match[2]}`)
    }
  }
  console.log('')
}

function printHelp() {
  console.log(banner)
  console.log(`${c.bold}COMMANDS:${c.reset}
  ${c.cyan}make:page <Name>${c.reset}       Generate a new dashboard page and auto-register menu & route
  ${c.cyan}make:crud <Name>${c.reset}       Generate a full CRUD resource (DataTable + AutoForm + Modals)
  ${c.cyan}make:component <Name>${c.reset}  Scaffold a reusable Vue component in src/components/
  ${c.cyan}make:adapter <Name>${c.reset}    Scaffold an auth adapter in src/core/auth/
  ${c.cyan}list:routes${c.reset}            List all registered sidebar navigation items

${c.bold}OPTIONS:${c.reset}
  ${c.yellow}--title="Title"${c.reset}        Custom display title
  ${c.yellow}--route=/path${c.reset}          Custom URL route (defaults to /<kebab-name>)
  ${c.yellow}--icon=IconName${c.reset}        Lucide icon name (e.g. Package, Users, ShoppingCart)
  ${c.yellow}--roles=admin,user${c.reset}     Restrict route/menu to specific roles (RBAC)
  ${c.yellow}--fields=f1:type,f2:type${c.reset} Comma-separated fields for make:crud (text, number, select)
  ${c.yellow}--parent=MenuName${c.reset}      Nest under an existing sidebar parent menu
  ${c.yellow}--no-nav${c.reset}               Do not register in sidebar navigation
  ${c.yellow}--force${c.reset}                Overwrite existing file

${c.bold}EXAMPLES:${c.reset}
  ${c.dim}# Simple page:${c.reset}
  npx cepat make:page Reports --icon=FileSpreadsheet

  ${c.dim}# Full CRUD with custom fields & admin role:${c.reset}
  npx cepat make:crud Products --icon=Package --fields=name:text,price:number,category:select,status:select --roles=admin

  ${c.dim}# Component:${c.reset}
  npx cepat make:component MetricBadge
`)
}

// --- Main CLI dispatch ---
const args = process.argv.slice(2)
const parsed = parseArgs(args)
const command = parsed._[0]
const targetName = parsed._[1]

switch (command) {
  case 'make:page':
    makePage(targetName, parsed.options)
    break
  case 'make:crud':
    makeCrud(targetName, parsed.options)
    break
  case 'make:component':
    makeComponent(targetName, parsed.options)
    break
  case 'make:adapter':
    makeAdapter(targetName, parsed.options)
    break
  case 'list:routes':
  case 'routes':
    listRoutes()
    break
  case 'help':
  case '--help':
  case '-h':
  case undefined:
    printHelp()
    break
  default:
    console.error(`${c.red}Unknown command: ${command}${c.reset}`)
    printHelp()
    process.exit(1)
}
