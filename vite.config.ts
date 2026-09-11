import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),

    tailwindcss(),

    // Auto-import Vue, Vue Router, Pinia composables — no more manual imports
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
        {
          '@vueuse/head': ['useHead', 'useSeoMeta'],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      vueTemplate: true,
    }),

    // Auto-import components from src/components & src/core/components
    Components({
      dirs: ['src/components', 'src/core/components'],
      dts: 'src/components.d.ts',
      extensions: ['vue'],
    }),
  ],

  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },

  css: {
    devSourcemap: true,
  },
})
