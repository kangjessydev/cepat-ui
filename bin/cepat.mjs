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
  ${c.dim}Cepat UI DX Generator v1.0.0${c.reset}
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

// --- Parsing helpers ---
function parseNavigationItems(content) {
  const items = []
  const arrayMatch = content.match(/navigationItems:\s*NavItem\[\]\s*=\s*\[([\s\S]*)\]\s*$/m)
  if (!arrayMatch) return items

  const body = arrayMatch[1]
  let depth = 0
  let currentBlock = ''
  let inString = false
  let stringChar = ''
  let inLineComment = false

  const rawBlocks = []

  for (let i = 0; i < body.length; i++) {
    const ch = body[i]
    const nextCh = body[i + 1]

    if (inLineComment) {
      if (ch === '\n') inLineComment = false
      continue
    }

    if (!inString && ch === '/' && nextCh === '/') {
      inLineComment = true
      i++
      continue
    }

    if (!inString && (ch === "'" || ch === '"' || ch === '`')) {
      inString = true
      stringChar = ch
      if (depth > 0) currentBlock += ch
      continue
    }

    if (inString && ch === stringChar && body[i - 1] !== '\\') {
      inString = false
      if (depth > 0) currentBlock += ch
      continue
    }

    if (inString) {
      if (depth > 0) currentBlock += ch
      continue
    }

    if (ch === '{') {
      if (depth === 0) currentBlock = ''
      depth++
      currentBlock += ch
      continue
    }

    if (ch === '}') {
      depth--
      currentBlock += ch
      if (depth === 0) {
        rawBlocks.push(currentBlock)
        currentBlock = ''
      }
      continue
    }

    if (depth > 0) {
      currentBlock += ch
    }
  }

  for (const block of rawBlocks) {
    const titleMatch = block.match(/title:\s*['"]([^'"]+)['"]/)
    const iconMatch = block.match(/icon:\s*['"]([^'"]+)['"]/)
    const routeMatch = block.match(/route:\s*['"]([^'"]+)['"]/)
    const rolesMatch = block.match(/roles:\s*\[([^\]]*)\]/)
    const childrenMatch = block.match(/children:\s*\[([\s\S]*)\]/)

    const title = titleMatch ? titleMatch[1] : ''
    const icon = iconMatch ? iconMatch[1] : ''
    const roles = rolesMatch
      ? rolesMatch[1].split(',').map(r => r.replace(/['"\s]/g, '')).filter(Boolean)
      : []

    if (!title) continue

    if (childrenMatch) {
      const childBody = childrenMatch[1]
      const childBlocks = []
      let cDepth = 0
      let cBlock = ''
      for (const c of childBody) {
        if (c === '{') {
          if (cDepth === 0) cBlock = ''
          cDepth++
          cBlock += c
        } else if (c === '}') {
          cDepth--
          cBlock += c
          if (cDepth === 0) {
            childBlocks.push(cBlock)
            cBlock = ''
          }
        } else if (cDepth > 0) {
          cBlock += c
        }
      }

      const children = childBlocks.map(cb => {
        const cTitle = (cb.match(/title:\s*['"]([^'"]+)['"]/) || [])[1] || ''
        const cIcon = (cb.match(/icon:\s*['"]([^'"]+)['"]/) || [])[1] || ''
        const cRoute = (cb.match(/route:\s*['"]([^'"]+)['"]/) || [])[1] || ''
        const cRolesMatch = cb.match(/roles:\s*\[([^\]]*)\]/)
        const cRoles = cRolesMatch
          ? cRolesMatch[1].split(',').map(r => r.replace(/['"\s]/g, '')).filter(Boolean)
          : []
        return { title: cTitle, icon: cIcon, route: cRoute, roles: cRoles }
      }).filter(c => c.title)

      items.push({ title, icon, roles, children })
    } else if (routeMatch) {
      items.push({ title, icon, route: routeMatch[1], roles })
    }
  }

  return items
}

function parseRouterRoutes(content) {
  const routes = []
  const matches = content.matchAll(/\{\s*path:\s*['"]([^'"]+)['"](?:[\s\S]*?name:\s*['"]([^'"]+)['"])?(?:[\s\S]*?meta:\s*\{([^}]*)\})?[\s\S]*?\}/g)

  for (const m of matches) {
    const routePath = m[1]
    const routeName = m[2] || ''
    const metaStr = m[3] || ''

    const isAuth = metaStr.includes('requiresAuth: false')
      ? false
      : (metaStr.includes('requiresAuth: true') ? true : undefined)
    const rolesMatch = metaStr.match(/roles:\s*\[([^\]]*)\]/)
    const roles = rolesMatch
      ? rolesMatch[1].split(',').map(r => r.replace(/['"\s]/g, '')).filter(Boolean)
      : []
    const titleMatch = metaStr.match(/title:\s*['"]([^'"]+)['"]/)
    const title = titleMatch ? titleMatch[1] : ''

    routes.push({ path: routePath, name: routeName, requiresAuth: isAuth, roles, title })
  }
  return routes
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

  // 1. Try to insert right before '// 404'
  const marker = '// 404'
  if (content.includes(marker)) {
    content = content.replace(marker, `${newRouteEntry}    ${marker}`)
    fs.writeFileSync(routerFile, content, 'utf-8')
    console.log(`  ${c.green}✓ Added route to ${c.bold}src/core/router/index.ts${c.reset}`)
    return true
  }

  // 2. Fallback: insert before wildcard route
  const catchAllRegex = /(\s*\{\s*path:\s*['"]\/:pathMatch)/
  if (catchAllRegex.test(content)) {
    content = content.replace(catchAllRegex, `\n${newRouteEntry}$1`)
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
  const navItems = parseNavigationItems(content)

  // Check for duplicate route or title
  for (const item of navItems) {
    if (item.route === route) {
      console.log(`  ${c.yellow}⚠ Navigation route '${route}' already exists in navigation.ts${c.reset}`)
      return false
    }
    if (!parent && item.title.toLowerCase() === title.toLowerCase()) {
      console.log(`  ${c.yellow}⚠ Navigation item '${title}' already exists at root in navigation.ts${c.reset}`)
      return false
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.route === route) {
          console.log(`  ${c.yellow}⚠ Navigation route '${route}' already exists under '${item.title}' in navigation.ts${c.reset}`)
          return false
        }
        if (parent && item.title.toLowerCase() === parent.toLowerCase() && child.title.toLowerCase() === title.toLowerCase()) {
          console.log(`  ${c.yellow}⚠ Navigation item '${title}' already exists under parent '${parent}' in navigation.ts${c.reset}`)
          return false
        }
      }
    }
  }

  const roleEntry = roles && roles.length > 0 ? `,\n    roles: [${roles.map(r => `'${r}'`).join(', ')}]` : ''

  if (parent) {
    const parentGroup = navItems.find(item => item.title.toLowerCase() === parent.toLowerCase() && item.children)
    if (!parentGroup) {
      console.log(`  ${c.yellow}⚠ Parent menu group '${parent}' not found. Creating parent group '${toTitleCase(parent)}'...${c.reset}`)
      const newParentGroup = `  {
    title: '${toTitleCase(parent)}',
    icon: 'Folder',
    order: 99,
    children: [
      {
        title: '${title}',
        icon: '${icon}',
        route: '${route}'${roleEntry},
      },
    ],
  },
`
      const lastBracket = content.lastIndexOf(']')
      if (lastBracket !== -1) {
        content = content.slice(0, lastBracket) + newParentGroup + content.slice(lastBracket)
        fs.writeFileSync(navFile, content, 'utf-8')
        console.log(`  ${c.green}✓ Created parent group '${toTitleCase(parent)}' with '${title}' in ${c.bold}src/core/router/navigation.ts${c.reset}`)
        return true
      }
      return false
    }

    // Insert inside existing parent group
    const parentRegex = new RegExp(`(title:\\s*['"]${parentGroup.title}['"][\\s\\S]*?children:\\s*\\[)`, 'i')
    if (parentRegex.test(content)) {
      const childEntry = `\n      {
        title: '${title}',
        icon: '${icon}',
        route: '${route}'${roleEntry},
      },`
      content = content.replace(parentRegex, match => match + childEntry)
      fs.writeFileSync(navFile, content, 'utf-8')
      console.log(`  ${c.green}✓ Added menu item under '${parentGroup.title}' in ${c.bold}src/core/router/navigation.ts${c.reset}`)
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
  const defaultRoute = options.parent ? `/${toKebabCase(options.parent)}/${kebabName}` : `/${kebabName}`
  const routePath = options.route || defaultRoute
  const icon = options.icon || 'FileText'
  const roles = options.roles ? options.roles.split(',').map(r => r.trim()) : []
  const force = !!options.force
  const noNav = !!options['no-nav']

  const targetDir = options.parent
    ? path.join(ROOT, 'src/pages', toKebabCase(options.parent))
    : path.join(ROOT, 'src/pages', kebabName)
  const targetFile = options.parent
    ? path.join(targetDir, `${kebabName}.vue`)
    : path.join(targetDir, 'index.vue')
  const componentPath = options.parent
    ? `@/pages/${toKebabCase(options.parent)}/${kebabName}.vue`
    : `@/pages/${kebabName}/index.vue`
  const routeName = options.parent ? `${toKebabCase(options.parent)}-${kebabName}` : kebabName

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
  console.log(`  ${c.cyan}File:${c.reset} ${path.relative(ROOT, targetFile)}`)

  // Register router
  registerRoute({
    routePath,
    routeName,
    componentPath,
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
  const defaultRoute = options.parent ? `/${toKebabCase(options.parent)}/${kebabName}` : `/${kebabName}`
  const routePath = options.route || defaultRoute
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

  const targetDir = options.parent
    ? path.join(ROOT, 'src/pages', toKebabCase(options.parent), kebabName)
    : path.join(ROOT, 'src/pages', kebabName)
  const targetFile = path.join(targetDir, 'index.vue')
  const componentPath = options.parent
    ? `@/pages/${toKebabCase(options.parent)}/${kebabName}/index.vue`
    : `@/pages/${kebabName}/index.vue`
  const routeName = options.parent ? `${toKebabCase(options.parent)}-${kebabName}` : kebabName

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
  console.log(`  ${c.cyan}File:${c.reset} ${path.relative(ROOT, targetFile)}`)
  console.log(`  ${c.dim}Features included: DataTable, AutoForm modal, Create/Edit/Delete, Search, Sort, Pagination, Bulk Actions.${c.reset}`)

  // Register router
  registerRoute({
    routePath,
    routeName,
    componentPath,
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
    const navItems = parseNavigationItems(navContent)

    console.log(`${c.cyan}${c.bold}Sidebar Navigation Items (src/core/router/navigation.ts):${c.reset}`)
    for (const item of navItems) {
      const roleBadge = item.roles && item.roles.length > 0 ? ` ${c.magenta}[roles: ${item.roles.join(', ')}]${c.reset}` : ''
      if (item.children && item.children.length > 0) {
        console.log(`  ${c.blue}📁 ${c.bold}${item.title} (group)${c.reset}${roleBadge}`)
        for (let i = 0; i < item.children.length; i++) {
          const child = item.children[i]
          const isLast = i === item.children.length - 1
          const prefix = isLast ? '     └─' : '     ├─'
          const cRole = child.roles && child.roles.length > 0 ? ` ${c.magenta}[roles: ${child.roles.join(', ')}]${c.reset}` : ''
          console.log(`${prefix} ${c.green}${child.title.padEnd(18)}${c.reset} ${c.dim}→${c.reset} ${child.route}${cRole}`)
        }
      } else if (item.route) {
        console.log(`  • ${c.green}${item.title.padEnd(20)}${c.reset} ${c.dim}→${c.reset} ${item.route}${roleBadge}`)
      }
    }
  }

  if (fs.existsSync(routerFile)) {
    const routerContent = fs.readFileSync(routerFile, 'utf-8')
    const routerRoutes = parseRouterRoutes(routerContent)

    console.log(`\n${c.cyan}${c.bold}Vue Router Registered Routes (src/core/router/index.ts):${c.reset}`)
    for (const r of routerRoutes) {
      if (!r.path) continue
      const namePart = r.name ? `${c.dim}(name: ${r.name})${c.reset} ` : ''
      const authPart = r.requiresAuth === false
        ? `${c.yellow}[public]${c.reset}`
        : (r.requiresAuth === true ? `${c.green}[auth]${c.reset}` : '')
      const rolePart = r.roles && r.roles.length > 0 ? ` ${c.magenta}[roles: ${r.roles.join(', ')}]${c.reset}` : ''
      console.log(`  • ${c.bold}${r.path.padEnd(24)}${c.reset} ${namePart}${authPart}${rolePart}`)
    }
  }
  console.log('')
}

function useBackend(type, options) {
  if (!type) {
    console.log(`\n${c.bold}Usage:${c.reset} cepat use:backend <mock|sanctum>\n`)
    process.exit(1)
  }

  const authPluginFile = path.join(ROOT, 'src/plugins/auth.ts')
  const envFile = path.join(ROOT, '.env')

  let envContent = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf-8') : ''

  if (type === 'mock') {
    const pluginCode = `// src/plugins/auth.ts
// Configured by: cepat use:backend mock
import { MockAuthAdapter } from '@/core/auth'

export const authAdapter = new MockAuthAdapter()
`
    fs.writeFileSync(authPluginFile, pluginCode, 'utf-8')
    console.log(`\n${c.green}${c.bold}✓ Switched to Mock Auth Adapter${c.reset}`)
    console.log(`  ${c.dim}Demo mode active. In-memory authentication.${c.reset}`)
    console.log(`  ${c.dim}Accounts: admin@cepat.dev / password123 | user@cepat.dev / password123${c.reset}\n`)
    return
  }

  if (type === 'sanctum' || type === 'laravel') {
    const pluginCode = `// src/plugins/auth.ts
// Configured by: cepat use:backend sanctum
import { LaravelSanctumAdapter } from '@/core/auth'

export const authAdapter = new LaravelSanctumAdapter()
`
    fs.writeFileSync(authPluginFile, pluginCode, 'utf-8')

    const apiUrl = options.url || 'http://localhost:8000'
    if (!envContent.includes('VITE_API_URL=')) {
      envContent += `\n# Backend API URL\nVITE_API_URL=${apiUrl}\n`
    } else {
      envContent = envContent.replace(/VITE_API_URL=.*/, `VITE_API_URL=${apiUrl}`)
    }
    if (envContent.includes('VITE_API_BASE_URL=')) {
      envContent = envContent.replace(/VITE_API_BASE_URL=.*/, `VITE_API_BASE_URL=${apiUrl}`)
    }
    fs.writeFileSync(envFile, envContent.trim() + '\n', 'utf-8')

    console.log(`\n${c.green}${c.bold}🎉 Switched to Laravel Sanctum Auth Adapter!${c.reset}`)
    console.log(`  ${c.cyan}Auth Adapter:${c.reset} src/plugins/auth.ts → LaravelSanctumAdapter`)
    console.log(`  ${c.cyan}API Base URL:${c.reset} ${apiUrl} (saved in .env)`)
    console.log(`\n${c.bold}Laravel Setup Checklist:${c.reset}`)
    console.log(`  1. Copy starter backend from ${c.bold}examples/backend-laravel/${c.reset} to your Laravel project.`)
    console.log(`  2. Ensure CORS is enabled for ${c.cyan}http://localhost:5173${c.reset} with credentials: true.`)
    console.log(`  3. Start Laravel server: ${c.dim}php artisan serve${c.reset}\n`)
    return
  }

  console.error(`${c.red}Unknown backend type: ${type}.${c.reset} Available types: mock, sanctum`)
  process.exit(1)
}

function printHelp() {
  console.log(banner)
  console.log(`${c.bold}COMMANDS:${c.reset}
  ${c.cyan}make:page <Name>${c.reset}       Generate a new dashboard page and auto-register menu & route
  ${c.cyan}make:crud <Name>${c.reset}       Generate a full CRUD resource (DataTable + AutoForm + Modals)
  ${c.cyan}make:component <Name>${c.reset}  Scaffold a reusable Vue component in src/components/
  ${c.cyan}make:adapter <Name>${c.reset}    Scaffold an auth adapter in src/core/auth/
  ${c.cyan}use:backend <type>${c.reset}     Switch auth adapter (mock, sanctum) & setup .env
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

  ${c.dim}# Switch backend to Laravel Sanctum:${c.reset}
  npx cepat use:backend sanctum

  ${c.dim}# Switch backend back to demo Mock Auth:${c.reset}
  npx cepat use:backend mock
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
  case 'use:backend':
  case 'backend':
    useBackend(targetName, parsed.options)
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
